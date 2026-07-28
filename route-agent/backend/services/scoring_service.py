import random


def score_routes(routes, priority):

    ranked_routes = []

    for route in routes:

        traffic = random.choice([
            "Low",
            "Medium",
            "High"
        ])

        toll = random.randint(300, 900)

        score = 100

        score -= route["distance_km"] * 0.03

        score -= route["duration_hr"] * 5

        if traffic == "Medium":
            score -= 10

        elif traffic == "High":
            score -= 20

        if priority.lower() == "high":
            score -= route["duration_hr"] * 2

        ranked_routes.append({

            "route_name": route["route_name"],

            "distance_km": route["distance_km"],

            "duration_hr": route["duration_hr"],

            "traffic": traffic,

            "toll_cost": toll,

            "score": round(score, 2)

        })

    ranked_routes.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return ranked_routes