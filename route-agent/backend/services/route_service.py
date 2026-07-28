import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ORS_API_KEY")

URL = "https://api.openrouteservice.org/v2/directions/driving-car"


def get_route(start, end):

    headers = {
        "Authorization": API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [start["longitude"], start["latitude"]],
            [end["longitude"], end["latitude"]]
        ]
    }

    response = requests.post(URL, json=body, headers=headers)

    data = response.json()

    summary = data["routes"][0]["summary"]

    return {
        "distance_km": round(summary["distance"] / 1000, 2),
        "duration_hr": round(summary["duration"] / 3600, 2)
    }