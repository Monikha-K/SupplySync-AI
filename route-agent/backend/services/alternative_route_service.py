import random


def generate_alternative_routes(base_route):

    routes = []

    for i in range(3):

        routes.append({

            "route_name": f"Route {chr(65+i)}",

            "distance_km": round(
                base_route["distance_km"] + random.uniform(-15, 15),
                2
            ),

            "duration_hr": round(
                base_route["duration_hr"] + random.uniform(-0.6, 0.6),
                2
            )

        })

    return routes