from services.geocode_service import reverse_geocode


def _sample_coords(geometry, n=4):
    """Pick n evenly-spaced intermediate coordinates (excluding endpoints)."""
    if len(geometry) < 3:
        return []

    interior = geometry[1:-1]

    if len(interior) <= n:
        return interior

    step = len(interior) / n
    return [interior[int(i * step)] for i in range(n)]


def _build_route_name(pickup_city, delivery_city, geometry):
    """Reverse geocode sampled points and build a readable route name."""
    sampled = _sample_coords(geometry, n=4)

    cities = []
    seen = {pickup_city.lower(), delivery_city.lower()}

    for lon, lat in sampled:
        city = reverse_geocode(lat, lon)
        if city and city.lower() not in seen:
            cities.append(city)
            seen.add(city.lower())

    parts = [pickup_city] + cities + [delivery_city]
    return " → ".join(parts)


def generate_alternative_routes(ors_routes, pickup_city, delivery_city):
    """
    Convert raw ORS routes into named route dicts.
    ors_routes: list of {distance_km, duration_hr, geometry}
    """
    result = []

    for route in ors_routes:
        name = _build_route_name(pickup_city, delivery_city, route["geometry"])

        result.append({
            "route_name": name,
            "distance_km": route["distance_km"],
            "duration_hr": route["duration_hr"],
            "geometry": route["geometry"]
        })

    return result
