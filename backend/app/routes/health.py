from fastapi import APIRouter, HTTPException
from app.models import HealthResponse
from app.services import client

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    """Check API health and FortyGuard connectivity"""
    fg_connected = client.check_api_status()
    
    return HealthResponse(
        status="healthy" if fg_connected else "degraded",
        fortyguard_connected=fg_connected,
        message="MediGuard AI is running" if fg_connected else "FortyGuard API connection failed"
    )


@router.get("/credits")
def credit_usage():
    """
    Surface the FortyGuard API key's remaining credit balance so the
    frontend can warn before a route assessment burns through the
    account (this is exactly the 402 "Insufficient credits" scenario
    we hit during testing — better to show it upfront than fail mid-demo).
    """
    try:
        raw = client.get_credit_usage()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach FortyGuard: {e}")

    # FortyGuard's exact field names for this endpoint aren't fully
    # documented in the handbook, so we pass the raw payload through
    # as `raw` while also trying a couple of likely key names for a
    # clean `credits_remaining` the frontend can render directly.
    inner = raw.get("data", raw)
    credit_summary = inner.get("credit_summary", {})
    credits_remaining = (
        credit_summary.get("cycle_remaining_credits")
        or credit_summary.get("total_remaining_credits")
        or inner.get("credits_remaining")
        or inner.get("remaining_credits")
    )

    return {
        "credits_remaining": credits_remaining,
        "credits_used_this_cycle": credit_summary.get("cycle_credits_used"),
        "usage_percentage": credit_summary.get("cycle_usage_percentage"),
        "credits_reset_date": inner.get("plan_details", {}).get("credits_reset_date"),
        "raw": raw,
    }