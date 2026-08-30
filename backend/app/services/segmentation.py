import math
from typing import List, Tuple

CITY_COORDS = {
    "phoenix": (33.4484, -112.0740),
    "houston": (29.7604, -95.3698),
    "boston": (42.3601, -71.0589),
    "los_angeles": (34.0522, -118.2437),
    "chicago": (41.8781, -87.6298),
    "miami": (25.7617, -80.1918),
    "denver": (39.7392, -104.9903),
    "colorado_springs": (38.8339, -104.8214),
    "seattle": (47.6062, -122.3321),
    "new_york": (40.7128, -74.0060),
    "san_francisco": (37.7749, -122.4194),
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance in miles between two coordinates.
    """
    R = 3959  # Earth radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (
        math.sin(delta_lat / 2) ** 2 +
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def segment_route(
    origin_city: str, 
    dest_city: str, 
    max_segment_miles: int = 40
) -> List[Tuple[float, float, float, float]]:
    """
    Split route into segments.
    
    Returns:
        List of (lat1, lon1, lat2, lon2) tuples for each segment
    """
    origin_key = origin_city.lower().replace(" ", "_")
    dest_key = dest_city.lower().replace(" ", "_")
    
    if origin_key not in CITY_COORDS:
        raise ValueError(f"Origin city '{origin_city}' not found. Available: {list(CITY_COORDS.keys())}")
    if dest_key not in CITY_COORDS:
        raise ValueError(f"Destination city '{dest_city}' not found. Available: {list(CITY_COORDS.keys())}")
    
    origin_lat, origin_lon = CITY_COORDS[origin_key]
    dest_lat, dest_lon = CITY_COORDS[dest_key]
    
    total_distance = haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)
    
    # Calculate number of segments (max 40 miles each, keeps AOI < 50 mi²)
    num_segments = max(1, int(total_distance / max_segment_miles))
    
    segments = []
    for i in range(num_segments):
        t1 = i / num_segments
        t2 = (i + 1) / num_segments
        
        lat1 = origin_lat + (dest_lat - origin_lat) * t1
        lon1 = origin_lon + (dest_lon - origin_lon) * t1
        lat2 = origin_lat + (dest_lat - origin_lat) * t2
        lon2 = origin_lon + (dest_lon - origin_lon) * t2
        
        segments.append((lat1, lon1, lat2, lon2))
    
    print(f"Route {origin_city} → {dest_city}: {total_distance:.1f} miles, {num_segments} segments")
    return segments

def create_polygon_geojson(lat1: float, lon1: float, lat2: float, lon2: float) -> dict:
    """
    Small box centered on the segment MIDPOINT (not a box spanning both
    endpoints) — keeps AOI area under FortyGuard's 50 mi^2 cap.
    """
    mid_lat = (lat1 + lat2) / 2
    mid_lon = (lon1 + lon2) / 2

    delta_lat = 0.01
    delta_lon = 0.01

    min_lat = mid_lat - delta_lat
    max_lat = mid_lat + delta_lat
    min_lon = mid_lon - delta_lon
    max_lon = mid_lon + delta_lon
    
    return {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [min_lon, min_lat],
                    [max_lon, min_lat],
                    [max_lon, max_lat],
                    [min_lon, max_lat],
                    [min_lon, min_lat]
                ]]
            }
        }]
    }
