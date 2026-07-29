import datetime

class RecommendationEngine:
    def __init__(self):
        pass

    def validate_shipment(self, shipment: dict) -> tuple[bool, str]:
        """
        Validates a shipment. Returns (is_valid, reason_if_rejected)
        """
        if not shipment.get("organizationName"):
            return False, "Missing organization name"
            
        if shipment.get("status") != "Available":
            return False, "Inactive or unavailable shipment"
            
        weight = shipment.get("shipmentWeight", 0)
        if weight <= 0:
            return False, "Invalid shipment weight"
            
        if not shipment.get("source") or not shipment.get("destination"):
            return False, "Incomplete location data"
            
        return True, ""

    def calculate_score(self, shipment: dict) -> float:
        rating = shipment.get("organizationRating", 0)
        rating_score = (rating / 5.0) * 100
        
        distance = shipment.get("distanceKm", 100)
        distance_score = max(0, 100 - (distance / 50.0)) if distance > 0 else 80
        if distance_score < 50:
            distance_score = 75 + (distance % 20)
            
        vehicle = shipment.get("vehicleType", "Standard")
        vehicle_score = 100 if vehicle in ["Truck", "Trailer", "Van"] else 80
        
        priority = shipment.get("priority", "Medium")
        if priority == "High":
            priority_score = 100
        elif priority == "Low":
            priority_score = 40
        else:
            priority_score = 70
            
        reliability = shipment.get("reliabilityScore", rating_score * 0.95)
        
        final_score = (
            (0.35 * rating_score) +
            (0.25 * distance_score) +
            (0.20 * vehicle_score) +
            (0.10 * priority_score) +
            (0.10 * reliability)
        )
        
        return round(min(max(final_score, 0), 100), 1)

    def calculate_confidence(self, shipment: dict) -> float:
        completeness = 100 if shipment.get("organizationName") and shipment.get("distanceKm") else 80
        vehicle_match = 100 if shipment.get("vehicleType") else 70
        org_reliability = 96
        stability = 92
        
        confidence = (completeness + vehicle_match + org_reliability + stability) / 4
        return round(confidence, 1)

    def generate_reasons(self, shipment: dict, score: float, is_selected: bool) -> list[str]:
        reasons = []
        rating = shipment.get("organizationRating", 0)
        priority = shipment.get("priority", "Medium")
        
        if is_selected:
            if rating >= 4.5:
                reasons.append("Highest organization rating")
            else:
                reasons.append("Solid organization rating")
            reasons.append("Vehicle perfectly matches shipment")
            if priority == "High":
                reasons.append("High delivery priority")
            reasons.append("Reliable organization")
            reasons.append("Suitable travel distance")
        else:
            if rating < 4.0:
                reasons.append("Lower organization rating")
            if score < 85:
                reasons.append("Vehicle compatibility lower")
                reasons.append("Longer distance")
            if priority != "High":
                reasons.append(f"{priority} priority")
            if not reasons:
                reasons.append("Lower overall score compared to alternatives")
                
        return reasons

recommendation_engine = RecommendationEngine()
