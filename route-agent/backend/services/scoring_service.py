import random


def score_route(route, priority):

    traffic = random.choice(["Low", "Medium", "High"])

    toll = random.randint(300, 900)

    score = 100

    # Distance Score
    score -= route["distance_km"] * 0.03

    # Duration Score
    score -= route["duration_hr"] * 5

    # Traffic Penalty
    if traffic == "Medium":
        score -= 10

    elif traffic == "High":
        score -= 20

    # Priority Adjustment
    if priority.lower() == "high":
        score -= route["duration_hr"] * 2

    return {
        "distance_km": route["distance_km"],
        "duration_hr": route["duration_hr"],
        "traffic": traffic,
        "toll_cost": toll,
        "score": round(score, 2)
    }