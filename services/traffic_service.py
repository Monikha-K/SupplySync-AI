import os
import logging
from typing import Dict, Any

logger = logging.getLogger("supplysync.traffic_service")


class TrafficService:
    """Service to collect traffic congestion metrics along logistics routes."""

    def __init__(self):
        self.api_key = os.getenv("TRAFFIC_API_KEY")

    def get_traffic_conditions(self, current_location: str, destination: str, current_traffic: str = None) -> Dict[str, Any]:
        """
        Analyze traffic conditions between current location and destination.
        Returns congestion level, estimated slowdown factor, and route delay risk.
        """
        traffic_status = (current_traffic or "Light").title()
        
        if traffic_status in ["Heavy", "Gridlock", "Severe"]:
            congestion_level = "High"
            slowdown_multiplier = 1.6
            delay_impact_mins = 35
            risk_contribution = 35
        elif traffic_status in ["Moderate", "Medium", "Slow"]:
            congestion_level = "Medium"
            slowdown_multiplier = 1.25
            delay_impact_mins = 15
            risk_contribution = 15
        else:
            congestion_level = "Low"
            slowdown_multiplier = 1.0
            delay_impact_mins = 0
            risk_contribution = 0

        return {
            "current_location": current_location,
            "destination": destination,
            "traffic_status": traffic_status,
            "congestion_level": congestion_level,
            "slowdown_multiplier": slowdown_multiplier,
            "estimated_delay_impact_mins": delay_impact_mins,
            "risk_contribution_score": risk_contribution
        }


# Global instance
traffic_service = TrafficService()
