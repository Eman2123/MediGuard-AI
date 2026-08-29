from fastapi import APIRouter, HTTPException
from app.models import ShipmentRequest, ParseRequest, ShipmentResponse, SegmentResult
from app.services import (
    segment_route,
    create_polygon_geojson,
    haversine_distance,
    RiskAssessment,
    estimate_cooling_cost,
    estimate_full_route_cost,
    parse_shipment_request,
    client
)
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import uuid
from app.services.segmentation import CITY_COORDS
from app.services.risk_engine import CARGO_THRESHOLDS
from app.services.history_store import record_assessment

router = APIRouter(prefix="/api", tags=["shipment"])

MAX_CONCURRENT_REQUESTS = 3
MAX_UNKNOWN_FRACTION_FOR_TRUST = 0.0


@router.get("/cities")
def get_available_cities():
    return {"cities": list(CITY_COORDS.keys())}


@router.get("/cargo-types")
def get_cargo_types():
    return {"cargo_types": list(CARGO_THRESHOLDS.keys())}


@router.post("/parse-shipment")
def parse_shipment(request: ParseRequest):
    try:
        parsed = parse_shipment_request(request.user_input)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def _fetch_and_assess_segment(
    index: int,
    lat1: float, lon1: float, lat2: float, lon2: float,
    date: str, query_time: str,
    risk_assessor: RiskAssessment,
    cargo_type: str
) -> dict:
    distance = haversine_distance(lat1, lon1, lat2, lon2)

    try:
        polygon = create_polygon_geojson(lat1, lon1, lat2, lon2)
        print(f"\nSegment {index + 1}: Fetching heatmap...")
        heatmap_result = client.fetch_heatmap(polygon, date, query_time)

        risk = risk_assessor.assess_segment(heatmap_result)
        cost = estimate_cooling_cost(cargo_type, distance, risk["is_flagged"])

        print(f"  OK Segment {index + 1}: {distance:.1f} mi, {risk['max_temp']}C, "
              f"{'FLAGGED' if risk['is_flagged'] else risk['risk_level'].upper()}")

        return {
            "index": index,
            "lat1": lat1, "lon1": lon1,
            "distance": distance,
            "risk": risk,
            "cost": cost,
            "error": None,
        }

    except Exception as e:
        print(f"  X Error on segment {index + 1}: {e}")
        return {
            "index": index,
            "lat1": lat1, "lon1": lon1,
            "distance": distance,
            "risk": {
                "max_temp": 0, "mean_temp": 0,
                "is_flagged": False, "risk_level": "unknown",
            },
            "cost": 0,
            "error": str(e),
        }


def _assess_shipment_core(req: ShipmentRequest) -> ShipmentResponse:
    try:
        dt = datetime.fromisoformat(req.departure_time)
    except Exception:
        raise ValueError(
            f"Invalid departure_time format: '{req.departure_time}'. "
            f"Expected ISO format like 2026-08-25T14:00:00"
        )

    now = datetime.utcnow()
    max_allowed = now + timedelta(hours=12)
    min_allowed = datetime(2021, 1, 1)

    if dt > max_allowed:
        raise ValueError(
            f"departure_time '{req.departure_time}' is too far in the future. "
            f"FortyGuard only supports forecasts up to 12 hours ahead "
            f"(latest allowed: {max_allowed.strftime('%Y-%m-%dT%H:%M:%S')}). "
            f"Please choose an earlier date/time."
        )

    if dt < min_allowed:
        raise ValueError(
            f"departure_time '{req.departure_time}' is before FortyGuard's data range (2021-01-01 onward)."
        )

    segments = segment_route(req.origin_city, req.destination_city)
    risk_assessor = RiskAssessment(req.cargo_type)

    try:
        date = req.departure_time.split("T")[0]
    except Exception:
        date = datetime.now().strftime("%Y-%m-%d")

    try:
        query_time = req.departure_time.split("T")[1][:5] if "T" in req.departure_time else "14:00"
    except Exception:
        query_time = "14:00"

    print(f"\n=== Assessing {req.cargo_type} shipment ===")
    print(f"Route: {req.origin_city} -> {req.destination_city}")
    print(f"Date: {date}, Query time: {query_time}")
    print(f"Fetching {len(segments)} segments with up to {MAX_CONCURRENT_REQUESTS} at a time...")

    raw_results = [None] * len(segments)

    with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) as executor:
        futures = {
            executor.submit(
                _fetch_and_assess_segment,
                i, lat1, lon1, lat2, lon2,
                date, query_time, risk_assessor, req.cargo_type
            ): i
            for i, (lat1, lon1, lat2, lon2) in enumerate(segments)
        }
        for future in as_completed(futures):
            result = future.result()
            raw_results[result["index"]] = result

    segment_results = []
    total_cooling_cost = 0.0
    flagged_count = 0
    unknown_count = 0
    total_distance = 0.0

    for r in raw_results:
        total_distance += r["distance"]
        risk = r["risk"]

        segment_results.append(SegmentResult(
            segment_id=r["index"] + 1,
            start_lat=round(r["lat1"], 4),
            start_lon=round(r["lon1"], 4),
            distance_miles=round(r["distance"], 1),
            max_temp_c=risk["max_temp"],
            mean_temp_c=risk["mean_temp"],
            is_flagged=risk["is_flagged"],
            cooling_cost=round(r["cost"], 2),
            risk_level=risk["risk_level"]
        ))

        if risk["is_flagged"]:
            flagged_count += 1
            total_cooling_cost += r["cost"]

        if risk["risk_level"] == "unknown":
            unknown_count += 1

    full_route_cost = estimate_full_route_cost(req.cargo_type, total_distance)
    savings = full_route_cost - total_cooling_cost

    # A common cause of "everything unknown": FortyGuard's near-real-time
    # processing has a lag, so times close to right now (or forecast times)
    # often aren't populated yet - even earlier THIS SAME DAY can work fine
    # if it's a few hours in the past (confirmed: today 06:00 UTC returned
    # real data while today ~07:20 and a same-day forecast both came back
    # empty). So the real trigger is "how recent relative to now", not
    # simply "is it today's calendar date".
    hours_ago = (datetime.utcnow() - dt).total_seconds() / 3600
    recency_hint = (
        " (Tip: very recent or forecasted times often aren't processed yet by "
        "FortyGuard - try a time from several hours ago, or an earlier date, "
        "for reliable results.)"
        if hours_ago < 3 and unknown_count > 0 else ""
    )

    if unknown_count > 0:
        action = (
            f"Could not verify temperature for {unknown_count}/{len(segment_results)} segments "
            f"(API credits or coverage gap) - do NOT treat this route as confirmed safe. "
            f"Of the segments we DID verify, {flagged_count} need cooling (${total_cooling_cost:.2f})."
            f"{recency_hint}"
        )
    elif flagged_count == 0:
        action = f"Route is safe. No cooling needed. You save ${full_route_cost:.2f}!"
    else:
        flagged_ids = [s.segment_id for s in segment_results if s.is_flagged]
        action = f"Cool segments {flagged_ids}. Targeted cost: ${total_cooling_cost:.2f}. Full route cost: ${full_route_cost:.2f}. Save ${savings:.2f}!"

    record_assessment({
        "shipment_id": f"mg-{uuid.uuid4().hex[:8]}",
        "cargo_type": req.cargo_type,
        "origin_city": req.origin_city,
        "destination_city": req.destination_city,
        "departure_time": req.departure_time,
        "total_flagged_segments": flagged_count,
        "total_unknown_segments": unknown_count,
        "total_cooling_cost": round(total_cooling_cost, 2),
        "savings": round(savings, 2),
    })

    return ShipmentResponse(
        shipment_id=f"mg-{uuid.uuid4().hex[:8]}",
        cargo_type=req.cargo_type,
        origin_city=req.origin_city,
        destination_city=req.destination_city,
        departure_time=req.departure_time,
        segments=segment_results,
        total_flagged_segments=flagged_count,
        total_unknown_segments=unknown_count,
        total_distance_miles=round(total_distance, 1),
        total_cooling_cost=round(total_cooling_cost, 2),
        full_route_cooling_cost=round(full_route_cost, 2),
        savings=round(savings, 2),
        recommended_action=action
    )


@router.post("/assess-shipment", response_model=ShipmentResponse)
def assess_shipment(req: ShipmentRequest):
    try:
        return _assess_shipment_core(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _build_candidate_datetimes(requested_iso: str):
    """
    Build 3 candidate departure datetimes to compare.

    Always includes at least one candidate ~24h in the past, which is
    virtually guaranteed to have real FortyGuard data (near-real-time
    processing lag means anything within ~3h of "now", or any forecast
    time, frequently comes back with n_cells=0 even on a successful
    request - confirmed empirically). Without this, a request whose
    departure_time fell outside FortyGuard's window used to generate
    THREE forecast/near-now candidates and the whole comparison would
    come back 0/3 verified no matter what.

    If the user's requested date/time falls inside FortyGuard's window
    (now .. now+12h), candidates are anchored around it. If it doesn't
    (e.g. "tomorrow", "next week"), we fall back to safe recent-past
    times instead, and flag that we had to adjust (adjusted=True) so
    the response stays honest about what was actually compared.
    """
    now = datetime.utcnow()
    max_allowed = now + timedelta(hours=12)
    min_allowed = datetime(2021, 1, 1)

    try:
        requested_dt = datetime.fromisoformat(requested_iso)
    except Exception:
        requested_dt = now

    # FortyGuard's near-real-time processing has a lag: times within ~3
    # hours of "now" (or any forecast time) reliably return n_cells=0 even
    # though the request itself succeeds (confirmed empirically - see
    # shipment.py history). A candidate 24h in the past is virtually
    # guaranteed to have been fully processed, so we always include one -
    # otherwise, whenever the user's request falls outside the window, ALL
    # THREE candidates used to be forecast/near-now and the whole comparison
    # would come back 0/3 verified no matter what.
    safe_recent_past = now - timedelta(hours=24)

    if min_allowed <= requested_dt <= max_allowed:
        candidates = sorted({
            requested_dt,
            safe_recent_past,
            min(now + timedelta(hours=8), max_allowed - timedelta(minutes=5)),
        })
        adjusted = False
    else:
        candidates = sorted({
            safe_recent_past,
            now - timedelta(hours=48),
            min(now + timedelta(hours=6), max_allowed - timedelta(minutes=5)),
        })
        adjusted = True

    return candidates, adjusted


def _rank_candidates(candidate_datetimes, build_request_fn):
    """
    Shared logic for optimize-departure / smart-assess:
    run each candidate datetime, skip ones outside FortyGuard's window,
    and NEVER let a candidate with unverified ("unknown") segments
    win just because it looks cheap - cheap due to missing data is
    not the same as cheap because it's actually safe.
    """
    results = []
    skipped = []

    for dt in candidate_datetimes:
        iso = dt.strftime("%Y-%m-%dT%H:%M:%S")
        modified_req = build_request_fn(iso)
        try:
            assessment = _assess_shipment_core(modified_req)
        except ValueError as e:
            skipped.append({"departure_time": iso, "reason": str(e)})
            continue

        results.append({
            "departure_time": iso,
            "total_cooling_cost": assessment.total_cooling_cost,
            "total_flagged_segments": assessment.total_flagged_segments,
            "total_unknown_segments": assessment.total_unknown_segments,
            "total_distance_miles": assessment.total_distance_miles,
            "avg_max_temp": round(
                sum(s.max_temp_c for s in assessment.segments if s.risk_level != "unknown")
                / max(1, len(assessment.segments) - assessment.total_unknown_segments), 1
            ) if assessment.total_unknown_segments < len(assessment.segments) else None,
            # Kept for map rendering on the frontend (lat/lon + risk per segment).
            # Not shown in the comparison table — only the winning candidate's
            # segments actually get used, but we compute it for every candidate
            # anyway since _assess_shipment_core already produced it for free.
            "segments": [
                {
                    "segment_id": s.segment_id,
                    "lat": s.start_lat,
                    "lon": s.start_lon,
                    "risk_level": s.risk_level,
                    "max_temp_c": s.max_temp_c,
                    "is_flagged": s.is_flagged,
                }
                for s in assessment.segments
            ],
        })

    if not results:
        raise ValueError(
            "None of the candidate departure times are within FortyGuard's allowed forecast window."
        )

    fully_verified = [r for r in results if r["total_unknown_segments"] == 0]

    if fully_verified:
        trustworthy_pool = fully_verified
        data_incomplete = False
    else:
        # Nobody is fully verified. Do NOT let cost alone decide the winner
        # here — a candidate with MORE unknown segments will look "cheaper"
        # simply because unknown segments never get flagged/costed, which
        # would let the least-verified option win. Instead: restrict to
        # whichever candidate(s) have the FEWEST unknown segments (i.e. the
        # most real data), and only break ties on cost within that group.
        data_incomplete = True
        min_unknown = min(r["total_unknown_segments"] for r in results)
        trustworthy_pool = [r for r in results if r["total_unknown_segments"] == min_unknown]

    best = min(trustworthy_pool, key=lambda r: r["total_cooling_cost"])
    worst_cost = max(r["total_cooling_cost"] for r in trustworthy_pool)
    savings = round(worst_cost - best["total_cooling_cost"], 2)

    return results, skipped, best, savings, data_incomplete


@router.post("/optimize-departure")
def optimize_departure(req: ShipmentRequest):
    candidate_dts, adjusted = _build_candidate_datetimes(req.departure_time)

    def build(iso: str) -> ShipmentRequest:
        return ShipmentRequest(
            cargo_type=req.cargo_type,
            origin_city=req.origin_city,
            destination_city=req.destination_city,
            departure_time=iso
        )

    try:
        results, skipped, best, savings, data_incomplete = _rank_candidates(candidate_dts, build)

        try:
            pretty_time = datetime.fromisoformat(best["departure_time"]).strftime("%b %d, %Y at %H:%M UTC")
        except Exception:
            pretty_time = best["departure_time"]

        route_segments = best.get("segments", [])
        comparisons_view = [{k: v for k, v in r.items() if k != "segments"} for r in results]

        return {
            "route": f"{req.origin_city} to {req.destination_city}",
            "cargo_type": req.cargo_type,
            "comparisons": comparisons_view,
            "route_segments": route_segments,
            "skipped_times": skipped,
            "recommended_departure_time": best["departure_time"],
            "recommended_departure_time_display": pretty_time,
            "fully_verified": not data_incomplete,
            "estimated_savings_vs_worst": savings,
            "adjusted_forecast_window": adjusted,
            "note": (
                "Your requested date/time is outside FortyGuard's 12-hour forecast "
                "window, so we compared the earliest available times instead."
            ) if adjusted else None,
            "warning": (
                "Every candidate time had at least one segment with unverifiable data "
                "(API credits or coverage gap) - this recommendation is based on incomplete "
                "temperature data. Re-run once credits/coverage are available before trusting it."
            ) if data_incomplete else None,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"ERROR in optimize-departure: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/smart-assess")
def smart_assess(request: ParseRequest):
    """
    Agentic endpoint: takes a plain-English shipment request, parses it,
    finds the best departure time, and returns a single human-readable
    recommendation - no manual field-filling required.
    """
    try:
        parsed = parse_shipment_request(request.user_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not understand request: {e}")

    try:
        shipment_req = ShipmentRequest(
            cargo_type=parsed["cargo_type"],
            origin_city=parsed["origin_city"],
            destination_city=parsed["destination_city"],
            departure_time=parsed["departure_time"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parsed data invalid: {e}")

    candidate_dts, adjusted = _build_candidate_datetimes(shipment_req.departure_time)

    def build(iso: str) -> ShipmentRequest:
        return ShipmentRequest(
            cargo_type=shipment_req.cargo_type,
            origin_city=shipment_req.origin_city,
            destination_city=shipment_req.destination_city,
            departure_time=iso
        )

    try:
        results, skipped, best, savings, data_incomplete = _rank_candidates(candidate_dts, build)

        try:
            requested_dt = datetime.fromisoformat(shipment_req.departure_time)
            requested_hours_ago = (datetime.utcnow() - requested_dt).total_seconds() / 3600
        except Exception:
            requested_hours_ago = 999  # unknown format - don't show the recency tip

        confidence_note = (
            " NOTE: this is based on incomplete temperature data (some segments could not be "
            "verified) - re-check before relying on it for an actual shipment."
            + (
                " Tip: very recent or forecasted times often aren't processed yet by "
                "FortyGuard - try a time from several hours ago, or an earlier date, "
                "for reliable results."
                if requested_hours_ago < 3 else ""
            )
            if data_incomplete else ""
        )
        window_note = (
            " NOTE: your requested time was outside FortyGuard's 12-hour forecast window, "
            "so the nearest available times were compared instead."
            if adjusted else ""
        )

        try:
            pretty_time = datetime.fromisoformat(best["departure_time"]).strftime("%b %d, %Y at %H:%M UTC")
        except Exception:
            pretty_time = best["departure_time"]

        if data_incomplete:
            time_phrase = "the most fully-assessed option we could evaluate"
            unknown_note = f" ({best['total_unknown_segments']} segment(s) could not be verified for this time)"
        else:
            time_phrase = "the best verified departure time"
            unknown_note = ""

        summary = (
            f"For your {shipment_req.cargo_type} shipment from "
            f"{shipment_req.origin_city.title()} to {shipment_req.destination_city.title()} "
            f"({best['total_distance_miles']} miles), {time_phrase} is "
            f"{pretty_time} - cooling cost ${best['total_cooling_cost']}, "
            f"with {best['total_flagged_segments']} segments needing cooling{unknown_note}. "
            f"This saves ${savings} compared to the worst option.{confidence_note}{window_note}"
        )

        # Keep the comparison table lean (frontend renders these as rows) —
        # strip the per-segment geo data out of each candidate and surface
        # it separately, just for the winning candidate, for the map view.
        route_segments = best.get("segments", [])
        comparisons_view = [{k: v for k, v in r.items() if k != "segments"} for r in results]

        return {
            "parsed_request": parsed,
            "comparisons": comparisons_view,
            "route_segments": route_segments,
            "skipped_times": skipped,
            "recommended_departure_time": best["departure_time"],
            "estimated_savings_vs_worst": savings,
            "data_incomplete": data_incomplete,
            "adjusted_forecast_window": adjusted,
            "summary": summary
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"ERROR in smart-assess: {e}")
        raise HTTPException(status_code=500, detail=str(e))