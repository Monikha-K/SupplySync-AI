from database import drivers_collection


def calculate_score(driver):

    score = 0

    # Rating (30)
    score += (driver["overall_rating"] / 5) * 30

    # Experience (20)
    score += min(driver["experience_years"], 20)

    # Safety (20)
    score += (driver["safety_score"] / 100) * 20

    # On-time (15)
    score += (driver["on_time_percentage"] / 100) * 15

    # Response Time (10)
    score += max(0, (20 - driver["average_response_time_minutes"])) / 20 * 10

    # Completed Trips (5)
    score += min(driver["completed_trips"] / 2500, 1) * 5

    return round(score, 2)


def filter_drivers(shipment):

    drivers = list(drivers_collection.find({}, {"_id": 0}))

    eligible = []

    for driver in drivers:

        # Driver should be available
        if not driver["available"]:
            continue

        # Ignore drivers already on trip/loading
        if driver["status"] not in ["Idle", "Waiting"]:
            continue

        # Capacity check
        if driver["capacity_kg"] < shipment.weight_kg:
            continue

        # Pickup city
        if driver["current_city"].lower() != shipment.pickup_city.lower():
            continue

        # Calculate AI Score
        driver["recommendation_score"] = calculate_score(driver)

        eligible.append(driver)

    eligible.sort(
        key=lambda x: x["recommendation_score"],
        reverse=True
    )

    return eligible[:5]