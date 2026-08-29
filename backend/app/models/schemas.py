from pydantic import BaseModel
from typing import Optional, List

class ShipmentRequest(BaseModel):
    cargo_type: str  # insulin, vaccine, blood, organ
    origin_city: str  # phoenix, houston, boston, etc
    destination_city: str
    departure_time: str  # ISO format: 2026-08-25T06:00:00

class ParseRequest(BaseModel):
    user_input: str  # Natural language input from chatbot

class SegmentResult(BaseModel):
    segment_id: int
    start_lat: float
    start_lon: float
    distance_miles: float
    max_temp_c: float
    mean_temp_c: float
    is_flagged: bool
    cooling_cost: float
    risk_level: str  # safe, warning, critical

class ShipmentResponse(BaseModel):
    shipment_id: str
    cargo_type: str
    origin_city: str
    destination_city: str
    departure_time: str
    segments: List[SegmentResult]
    total_flagged_segments: int
    total_unknown_segments: int  # segments where we got NO real data (credits/coverage failure) — NOT the same as "safe"
    total_distance_miles: float
    total_cooling_cost: float
    full_route_cooling_cost: float
    savings: float
    recommended_action: str

class HealthResponse(BaseModel):
    status: str
    fortyguard_connected: bool
    message: str