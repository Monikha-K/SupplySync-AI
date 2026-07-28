def calculate_eta(distance, traffic, weather):

    # Speed based on traffic
    traffic_speed = {
        "Low": 70,
        "Moderate": 55,
        "Heavy": 40
    }

    # Extra delay (minutes) based on weather
    weather_delay = {
        "Sunny": 0,
        "Cloudy": 10,
        "Rain": 30,
        "Fog": 45
    }

    speed = traffic_speed.get(traffic, 55)

    hours = distance / speed

    total_minutes = int(hours * 60)

    total_minutes += weather_delay.get(weather, 0)

    final_hours = total_minutes // 60
    final_minutes = total_minutes % 60

    return {
        "hours": final_hours,
        "minutes": final_minutes,
        "formatted": f"{final_hours} Hours {final_minutes} Minutes"
    }