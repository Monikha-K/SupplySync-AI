def generate_alternative_routes(base_route):

    routes = [

        {
            "route_name": "Fastest Route",
            "distance_km": round(base_route["distance_km"] + 8, 2),
            "duration_hr": round(base_route["duration_hr"] - 0.4, 2)
        },

        {
            "route_name": "Shortest Route",
            "distance_km": round(base_route["distance_km"] - 12, 2),
            "duration_hr": round(base_route["duration_hr"] + 0.3, 2)
        },

        {
            "route_name": "Economical Route",
            "distance_km": round(base_route["distance_km"] + 5, 2),
            "duration_hr": round(base_route["duration_hr"] + 0.2, 2)
        }

    ]

    return routes