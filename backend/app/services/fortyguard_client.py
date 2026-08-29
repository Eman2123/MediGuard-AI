import requests
import time
import random
import os
import json
import hashlib
import threading
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

load_dotenv()

_cache_lock = threading.Lock()

API_KEY = os.getenv("FORTYGUARD_API_KEY")
BASE_URL = os.getenv("FORTYGUARD_BASE_URL", "https://api.fortyguard.com")

# Candidate keys FortyGuard might use for the poll status field.
STATUS_KEY_CANDIDATES = ["status"]

# Values that mean "still working" / "done" / "failed"
DONE_VALUES = {"completed", "succeeded", "success", "done"}
FAILED_VALUES = {"failed", "error", "cancelled", "canceled"}

# --- Caching helpers ---
CACHE_FILE = Path(__file__).parent / ".heatmap_cache.json"


def _load_cache() -> Dict[str, Any]:
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_cache(cache: Dict[str, Any]) -> None:
    try:
        with _cache_lock:
            with open(CACHE_FILE, "w") as f:
                json.dump(dict(cache), f)
    except Exception as e:
        print(f"Cache save failed (non-fatal): {e}")


def _cache_key(polygon_geojson: Dict, start_date: str, start_time: str, granularity: int) -> str:
    raw = json.dumps(polygon_geojson, sort_keys=True) + start_date + start_time + str(granularity)
    return hashlib.md5(raw.encode()).hexdigest()


def _make_session() -> requests.Session:
    """
    Session with retry/backoff for connection hiccups.

    read-retries kept low (read=1) on purpose: the poll loop in
    FortyGuardClient._wait_for now owns backoff/retry for slow status
    checks. Stacking a second, independent backoff layer here on top of
    that (the old read=3, backoff_factor=1.5 config) meant a single slow
    poll could silently burn 45-75s inside one requests.get() call before
    even reaching our own retry logic -- which is exactly what was causing
    "FortyGuard connection error on poll: Max retries exceeded ... Read
    timed out" under the 8-way concurrent load. This session now only
    cushions true connection blips (DNS hiccup, connection reset).
    """
    session = requests.Session()
    retry = Retry(
        total=3,
        connect=3,          # retries on DNS / connection-refused / connection-reset
        read=1,              # one quick retry only — poll loop below handles the rest
        backoff_factor=1.0,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def _extract_status(inner: Dict) -> Optional[str]:
    for key in STATUS_KEY_CANDIDATES:
        if key in inner:
            return inner[key]
    return None


class FortyGuardClient:
    def __init__(
        self,
        poll_interval: float = 3.0,       # starting interval — handbook: "3s -> 6s -> 12s"
        max_poll_interval: float = 20.0,  # backoff cap
        poll_timeout: float = 300.0,      # total wall-clock budget per segment
        request_timeout: float = 30.0,    # per-HTTP-call timeout (was 15s — too tight under load)
        max_transient_retries: int = 4,   # timeout/connection blips retry with backoff instead of instantly failing the segment
        debug: bool = True,
    ):
        self.api_key = API_KEY
        self.base_url = BASE_URL
        self.poll_interval = poll_interval
        self.max_poll_interval = max_poll_interval
        self.poll_timeout = poll_timeout
        self.request_timeout = request_timeout
        self.max_transient_retries = max_transient_retries
        self.debug = debug
        self.session = _make_session()
        self.cache = _load_cache()

    def fetch_heatmap(
        self,
        polygon_geojson: Dict,
        start_date: str,
        start_time: str,
        granularity: int = 100
    ) -> Dict[str, Any]:
        """
        Submit heatmap request and poll until complete.

        Args:
            polygon_geojson: GeoJSON FeatureCollection with Polygon
            start_date: "2026-08-25"
            start_time: "14:00"
            granularity: 60, 80, or 100 meters

        Returns:
            Heatmap result with temperature statistics
        """
        # --- Check cache first ---
        cache_key = _cache_key(polygon_geojson, start_date, start_time, granularity)
        with _cache_lock:
            cached = self.cache.get(cache_key)
        if cached is not None:
            print(f"💾 Cache HIT for {start_date} {start_time} — skipping API call")
            return cached

        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "polygon_aoi": polygon_geojson,
            "date_time": {
                "start_date": start_date,
                "start_time": start_time,
                "filter_type": 1  # single hour
            },
            "granularity": granularity
        }

        # SUBMIT request
        try:
            print(f"Submitting heatmap request for {start_date} {start_time}...")
            response = self.session.post(
                f"{self.base_url}/v1/heatmap",
                headers=headers,
                json=payload,
                timeout=self.request_timeout
            )

            if self.debug:
                print(f"DEBUG raw response status: {response.status_code}")
                print(f"DEBUG raw response body: {response.text[:1000]}")
                print(f"DEBUG polygon sent: {json.dumps(polygon_geojson)}")

            if response.status_code != 200:
                raise Exception(f"Heatmap submit failed: {response.status_code} - {response.text}")

            response_json = response.json()
            activity_id = response_json.get("activity_id") or response_json.get("data", {}).get("activity_id")
            if not activity_id:
                raise Exception(f"No activity_id returned from FortyGuard. Full response: {response_json}")

            print(f"Activity ID: {activity_id}")

        except requests.exceptions.Timeout:
            raise Exception("FortyGuard API timeout on submit")
        except requests.exceptions.ConnectionError as e:
            raise Exception(f"FortyGuard connection error on submit (DNS/network): {e}")
        except Exception as e:
            raise Exception(f"FortyGuard submit error: {str(e)}")

        result = self._wait_for(activity_id, headers)

        # --- Save to cache (thread-safe) ---
        with _cache_lock:
            self.cache[cache_key] = result
            snapshot = dict(self.cache)
        _save_cache(snapshot)

        return result

    def fetch_env_params(
        self,
        lat: float,
        lon: float,
        start_date: str,
        start_time: str,
        temperature: float,
    ) -> Dict[str, Any]:
        """
        POST /v1/env_params — heat index, AQI, solar irradiance at a point.
        Requires a temperature reading as input (used to compute heat index) —
        confirmed via a 422 that named latitude/longitude/temperature as
        top-level required fields, not nested under "point".
        """
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "latitude": lat,
            "longitude": lon,
            "temperature": temperature,
            "date_time": {
                "start_date": start_date,
                "start_time": start_time,
                "filter_type": 1
            }
        }

        try:
            print(f"Submitting env_params request for ({lat}, {lon}) {start_date} {start_time}...")
            response = self.session.post(
                f"{self.base_url}/v1/env_params",
                headers=headers,
                json=payload,
                timeout=self.request_timeout
            )

            if self.debug:
                print(f"DEBUG env_params raw response status: {response.status_code}")
                print(f"DEBUG env_params raw response body: {response.text[:1000]}")

            if response.status_code != 200:
                raise Exception(f"env_params submit failed: {response.status_code} - {response.text}")

            response_json = response.json()
            activity_id = response_json.get("activity_id") or response_json.get("data", {}).get("activity_id")
            if not activity_id:
                raise Exception(f"No activity_id returned from FortyGuard. Full response: {response_json}")

            print(f"Activity ID: {activity_id}")

        except requests.exceptions.Timeout:
            raise Exception("FortyGuard API timeout on env_params submit")
        except requests.exceptions.ConnectionError as e:
            raise Exception(f"FortyGuard connection error on env_params submit: {e}")
        except Exception as e:
            raise Exception(f"FortyGuard env_params submit error: {str(e)}")

        return self._wait_for(activity_id, headers)

    def _wait_for(self, activity_id: str, headers: Dict) -> Dict[str, Any]:
        """
        Poll GET /v1/status/{activity_id} until terminal.

        Changes from the old fixed-interval version:
          - exponential backoff (poll_interval -> max_poll_interval) instead of a
            flat 2s hammer across every concurrent worker (handbook: "poll politely,
            back off... rather than hammering the endpoint")
          - jitter, so concurrent workers don't all hit the endpoint in lockstep
          - a single slow/timed-out poll retries with backoff instead of instantly
            failing the whole segment (this was the actual bug — one ReadTimeout
            was treated as fatal)
          - a wall-clock deadline instead of a raw poll count, since poll count is
            no longer a reliable proxy for elapsed time once backoff is in play
        """
        url = f"{self.base_url}/v1/status/{activity_id}"
        deadline = time.monotonic() + self.poll_timeout
        interval = self.poll_interval
        poll_count = 0
        transient_failures = 0
        unknown_streak = 0

        while True:
            try:
                status_resp = self.session.get(url, headers=headers, timeout=self.request_timeout)

                # Right after submit the activity can briefly 404 while it
                # propagates — treat as "still pending", not fatal.
                if status_resp.status_code == 404:
                    poll_count += 1
                    print(f"Poll {poll_count}: not visible yet (404) — retrying")
                else:
                    status_data = status_resp.json()
                    inner = status_data.get("data", status_data)
                    status = _extract_status(inner)
                    poll_count += 1
                    transient_failures = 0  # got a real response — reset

                    if status is None:
                        unknown_streak += 1
                        print(f"Poll {poll_count}: NO STATUS KEY FOUND | raw: {status_data}")
                        if unknown_streak == 1:
                            print(
                                "  -> Could not find status under any of "
                                f"{STATUS_KEY_CANDIDATES}. Add the real key name to "
                                "STATUS_KEY_CANDIDATES in fortyguard_client.py."
                            )
                    else:
                        print(f"Poll {poll_count}: {status}")

                    if status is not None and str(status).lower() in DONE_VALUES:
                        result = inner.get("result", inner)
                        # --- FULL raw result dump (was: only stats_data) ---
                        print(f"Heatmap complete. FULL result dict:\n{json.dumps(result, indent=2)}")
                        return result

                    if status is not None and str(status).lower() in FAILED_VALUES:
                        raise Exception(f"Heatmap processing failed: {status_data}")

            except requests.exceptions.Timeout:
                transient_failures += 1
                if transient_failures > self.max_transient_retries:
                    raise Exception(
                        f"FortyGuard API timeout on poll (gave up after "
                        f"{transient_failures} consecutive timeouts)"
                    )
                print(f"Poll timeout (transient {transient_failures}/{self.max_transient_retries}) — backing off")
            except requests.exceptions.ConnectionError as e:
                transient_failures += 1
                if transient_failures > self.max_transient_retries:
                    raise Exception(
                        f"FortyGuard connection error on poll (DNS/network), gave up after "
                        f"{transient_failures} consecutive failures: {e}"
                    )
                print(f"Poll connection error (transient {transient_failures}/{self.max_transient_retries}) — backing off")
            except Exception as e:
                if "Heatmap processing failed" in str(e):
                    raise
                raise

            if time.monotonic() >= deadline:
                raise Exception(
                    f"Heatmap polling timeout - exceeded {self.poll_timeout:.0f}s budget "
                    f"for activity {activity_id}"
                )

            # exponential backoff with jitter, capped at max_poll_interval
            sleep_for = min(interval, self.max_poll_interval) + random.uniform(0, 1.0)
            time.sleep(sleep_for)
            interval = min(interval * 2, self.max_poll_interval)

    def check_api_status(self) -> bool:
        """Verify API key and connection"""
        try:
            headers = {
                "api-key": self.api_key,
                "Content-Type": "application/json"
            }
            response = self.session.post(
                f"{self.base_url}/v1/system/fetch-api-key-usage",
                headers=headers,
                json={"api_key": self.api_key},
                timeout=10
            )
            return response.status_code == 200
        except Exception:
            return False

    def get_credit_usage(self) -> Dict[str, Any]:
        """
        Fetch the raw credit balance / billing-cycle usage for this API key
        (Handbook §7.5: POST /v1/system/fetch-api-key-usage, all plans).

        Returns whatever FortyGuard sends back (schema not fully documented
        in the handbook) so the route layer can decide what to surface,
        rather than guessing field names here and silently dropping data.
        """
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json"
        }
        try:
            response = self.session.post(
                f"{self.base_url}/v1/system/fetch-api-key-usage",
                headers=headers,
                json={"api_key": self.api_key},
                timeout=10
            )
        except requests.exceptions.Timeout:
            raise Exception("FortyGuard API timeout while checking credit usage")
        except requests.exceptions.ConnectionError as e:
            raise Exception(f"FortyGuard connection error while checking credit usage: {e}")

        if response.status_code != 200:
            raise Exception(
                f"Credit usage check failed: {response.status_code} - {response.text}"
            )

        return response.json()


# Global client instance
client = FortyGuardClient()