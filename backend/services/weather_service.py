import os
import logging
import requests
from typing import Dict, Any

logger = logging.getLogger("supplysync.weather_service")


class WeatherService:
    """Service to collect real-time or simulated weather metrics for locations along logistics routes."""

    def __init__(self):
        self.api_key = os.getenv("WEATHER_API_KEY")

    def get_weather_conditions(self, location: str, current_weather: str = None) -> Dict[str, Any]:
        """
        Collect weather metrics for a location.
        Returns weather condition, precipitation risk %, visibility rating, and impact factor.
        """
        if self.api_key and current_weather is None:
            try:
                url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={self.api_key}&units=metric"
                res = requests.get(url, timeout=4)
                if res.status_code == 200:
                    data = res.json()
                    main_weather = data["weather"][0]["main"]
                    temp = data["main"]["temp"]
                    logger.info(f"Fetched live weather for {location}: {main_weather}, {temp}°C")
                    return {
                        "condition": main_weather,
                        "temperature_celsius": temp,
                        "severity": "High" if main_weather in ["Rain", "Snow", "Thunderstorm", "Squall"] else "Low",
                        "impact_delay_multiplier": 1.4 if main_weather in ["Rain", "Snow", "Thunderstorm"] else 1.0
                    }
            except Exception as e:
                logger.warning(f"Failed to fetch live weather for {location}: {e}. Utilizing input factor.")

        # Fallback / Simulated metric calculation based on provided factor
        cond = (current_weather or "Clear").capitalize()
        high_risk_weather = ["Rain", "Storm", "Thunderstorm", "Snow", "Heavy Rain", "Fog", "Blizzard"]
        med_risk_weather = ["Light Rain", "Cloudy", "Windy", "Mist", "Haze"]

        if any(w in cond for w in ["Storm", "Heavy Rain", "Thunderstorm", "Blizzard"]):
            severity = "High"
            multiplier = 1.5
            delay_impact_mins = 45
        elif any(w in cond for w in high_risk_weather):
            severity = "Medium-High"
            multiplier = 1.3
            delay_impact_mins = 25
        elif any(w in cond for w in med_risk_weather):
            severity = "Medium"
            multiplier = 1.15
            delay_impact_mins = 10
        else:
            severity = "Low"
            multiplier = 1.0
            delay_impact_mins = 0

        return {
            "location": location,
            "condition": cond,
            "severity": severity,
            "impact_delay_multiplier": multiplier,
            "estimated_delay_impact_mins": delay_impact_mins
        }


# Global instance
weather_service = WeatherService()
