def score_routes(routes, priority):

    ranked_routes = []

    for route in routes:

        # Traffic based on travel time
        if route["duration_hr"] <= 6:
            traffic = "Low"
        elif route["duration_hr"] <= 7:
            traffic = "Medium"
        else:
            traffic = "High"

        # Toll based on distance
        toll = int(route["distance_km"] * 1.2)

        score = 100

        # Distance Penalty
        score -= route["distance_km"] * 0.03

        # Duration Penalty
        score -= route["duration_hr"] * 5

        # Traffic Penalty
        if traffic == "Medium":
            score -= 10
        elif traffic == "High":
            score -= 20

        # Toll Penalty
        score -= toll / 100

        # High Priority prefers faster routes
        if priority.lower() == "high":
            score -= route["duration_hr"] * 2

        ranked_routes.append({

            "route_name": route["route_name"],

            "distance_km": route["distance_km"],

            "duration_hr": route["duration_hr"],

            "traffic": traffic,

            "toll_cost": toll,

            "score": round(score, 2),

            "geometry": route.get("geometry", [])

        })

    ranked_routes.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return ranked_routes