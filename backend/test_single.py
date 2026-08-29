from app.services.segmentation import create_polygon_geojson, CITY_COORDS
from app.services.fortyguard_client import client

lat1, lon1 = CITY_COORDS["phoenix"]
lat2, lon2 = CITY_COORDS["houston"]

polygon = create_polygon_geojson(lat1, lon1, lat2, lon2)
result = client.fetch_heatmap(polygon, "2026-08-26", "14:00")

print("\n=== FINAL RESULT ===")
print(result)