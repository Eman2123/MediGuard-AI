from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.services.fortyguard_client import client
from app.services.segmentation import CITY_COORDS
from app.services.history_store import get_history

router = APIRouter(prefix="/api", tags=["environment"])


class EnvParamsRequest(BaseModel):
    city: str  # must be one of CITY_COORDS keys
    date_time: str  # ISO format, e.g. 2026-08-26T14:00:00
    temperature: float  # required by FortyGuard's env_params endpoint


@router.post("/env-params")
def get_env_params(request: EnvParamsRequest):
    """
    Standalone endpoint for FortyGuard's /v1/env_params (heat index, AQI,
    solar irradiance) at a city's coordinates. Kept separate from
    assess-shipment on purpose — folding it into the 14-segment pipeline
    would double credit usage on every route assessment.
    """
    city_key = request.city.lower().replace(" ", "_")
    if city_key not in CITY_COORDS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown city '{request.city}'. Available: {list(CITY_COORDS.keys())}"
        )
    lat, lon = CITY_COORDS[city_key]

    try:
        dt = datetime.fromisoformat(request.date_time)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date_time format: '{request.date_time}'. Expected ISO like 2026-08-26T14:00:00"
        )

    now = datetime.utcnow()
    if dt > now + timedelta(hours=12) or dt < datetime(2021, 1, 1):
        raise HTTPException(
            status_code=400,
            detail="date_time is outside FortyGuard's supported range (2021-01-01 to now+12h)."
        )

    date_str = request.date_time.split("T")[0]
    time_str = request.date_time.split("T")[1][:5] if "T" in request.date_time else "14:00"

    try:
        result = client.fetch_env_params(lat, lon, date_str, time_str, request.temperature)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"FortyGuard env_params error: {e}")

    return {
        "city": request.city,
        "date_time": request.date_time,
        "temperature_input": request.temperature,
        "result": result
    }


@router.get("/history")
def shipment_history():
    """Recent shipment assessments (most recent first), in-memory only."""
    return {"history": get_history()}