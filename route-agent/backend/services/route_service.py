import os
import requests
import polyline
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ORS_API_KEY")
URL = "https://api.openrouteservice.org/v2/directions/driving-car"

HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}


def _fetch(body):
    response = requests.post(URL, json=body, headers=HEADERS)
    if not response.ok:
        raise Exception(f"ORS API error {response.status_code}: {response.text}")
    return response.json()


def _parse_routes(data):
    routes = []
    for route in data.get("routes", []):
        summary = route["summary"]
        encoded = route.get("geometry", "")
        coords = []
        if isinstance(encoded, str) and encoded:
            decoded = polyline.decode(encoded)          # [(lat, lon), ...]
            coords = [[lon, lat] for lat, lon in decoded]
        routes.append({
            "distance_km": round(summary["distance"] / 1000, 2),
            "duration_hr": round(summary["duration"] / 3600, 2),
            "geometry": coords
        })
    return routes


def _midpoint(start, end):
    return (
        (start["latitude"] + end["latitude"]) / 2,
        (start["longitude"] + end["longitude"]) / 2
    )


def _fetch_single(start, end, waypoint=None):
    coords = [[start["longitude"], start["latitude"]]]
    if waypoint:
        coords.append([waypoint[1], waypoint[0]])   # [lon, lat]
    coords.append([end["longitude"], end["latitude"]])

    body = {"coordinates": coords, "geometry_simplify": False}
    return _parse_routes(_fetch(body))


def get_routes(start, end):
    """
    Try ORS alternative_routes. If the route is too long for that API limit,
    fall back to 3 single-route calls with slightly different midpoint waypoints
    to produce meaningfully different paths.
    """

    # --- Attempt 1: native alternative routes (works for routes < 100 km) ---
    try:
        body = {
            "coordinates": [
                [start["longitude"], start["latitude"]],
                [end["longitude"], end["latitude"]]
            ],
            "alternative_routes": {
                "target_count": 3,
                "weight_factor": 1.6,
                "share_factor": 0.6
            },
            "geometry_simplify": False
        }
        data = _fetch(body)
        routes = _parse_routes(data)
        if routes:
            return routes
    except Exception as e:
        if "2004" not in str(e) and "100000" not in str(e):
            raise   # re-raise unexpected errors

    # --- Fallback: 3 single-route calls with nudged midpoint waypoints ---
    mid_lat, mid_lon = _midpoint(start, end)

    # Perpendicular nudge offsets (in degrees, ~5-10 km lateral shift)
    offsets = [
        (0.0,   0.0),    # direct route
        (0.05, -0.05),   # nudge north-west
        (-0.05, 0.05),   # nudge south-east
    ]

    routes = []
    seen_distances = set()

    for dlat, dlon in offsets:
        waypoint = (mid_lat + dlat, mid_lon + dlon)
        try:
            result = _fetch_single(start, end, waypoint if (dlat or dlon) else None)
            if result:
                r = result[0]
                # Deduplicate routes that came back identical
                if r["distance_km"] not in seen_distances:
                    seen_distances.add(r["distance_km"])
                    routes.append(r)
        except Exception:
            continue

    return routes if routes else _fetch_single(start, end)
