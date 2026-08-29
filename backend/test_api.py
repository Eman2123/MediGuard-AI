# from app.services import client, create_polygon_geojson

# # Step 1: check auth/key
# print("API status:", client.check_api_status())

# # Step 2: try one real segment call
# polygon = create_polygon_geojson(33.4484, -112.074, 33.3009, -111.4058)
# try:
#     result = client.fetch_heatmap(polygon, "2026-08-25", "14:00")
#     print("SUCCESS:", result)
# except Exception as e:
#     print("REAL ERROR:", e)
# from app.services import client

# headers = {"api-key": client.api_key}
# resp = client.session.get(
#     f"{client.base_url}/v1/system/fetch-api-key-usage",
#     headers=headers,
#     timeout=10
# )
# print("Status code:", resp.status_code)
# print("Response body:", resp.text)
from app.services import client

headers = {"api-key": client.api_key, "Content-Type": "application/json"}
try:
    resp = client.session.post(
        f"{client.base_url}/v1/system/fetch-api-key-usage",
        headers=headers,
        json={"api_key": client.api_key},
        timeout=10
    )
    print("Status code:", resp.status_code)
    print("Response body:", resp.text)
except Exception as e:
    print("EXCEPTION:", repr(e))