import os
import json
import logging
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("supplysync.gemini_service")


class GeminiService:
    """Service encapsulating Google Gemini API reasoning using google-genai SDK."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Initialized Gemini client via google-genai SDK.")
            except Exception as e:
                logger.warning(f"Could not initialize google-genai client: {e}")

    def analyze_shipment_risk(self, shipment_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze logistics factors using Gemini LLM reasoning.
        Falls back to rule-guided AI heuristic engine if Gemini API key is unconfigured or call fails.
        """
        if self.client:
            try:
                prompt = self._build_prompt(shipment_dict)
                logger.info(f"Sending risk reasoning prompt to Gemini for shipment {shipment_dict.get('shipment_id')}")
                
                # Call Gemini model
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt
                )
                
                raw_text = response.text.strip()
                parsed = self._clean_and_parse_json(raw_text)
                if parsed and "risk_score" in parsed:
                    logger.info(f"Gemini successfully calculated risk score: {parsed.get('risk_score')}")
                    return parsed
            except Exception as e:
                logger.error(f"Gemini API request failed: {e}. Executing AI fallback reasoning engine.", exc_info=True)

        return self._heuristic_ai_risk_analysis(shipment_dict)

    def generate_customer_email(self, shipment_dict: Dict[str, Any], risk_analysis: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate a professional, empathetic customer email using Gemini or intelligent fallback.
        """
        customer_name = shipment_dict.get("customer_name", "Valued Customer")
        reasons_text = ", ".join(risk_analysis.get("reason", ["adverse transport conditions"]))
        expected_delay = risk_analysis.get("expected_delay", "30-45 minutes")
        eta = shipment_dict.get("expected_delivery_time", "6:45 PM")

        if self.client:
            try:
                prompt = f"""
                You are the Customer Communication Agent for SupplySync AI logistics platform.
                Generate a concise, highly professional customer update email regarding a predicted shipment delay.

                Shipment Details:
                - Customer Name: {customer_name}
                - Shipment ID: {shipment_dict.get('shipment_id')}
                - Destination: {shipment_dict.get('destination')}
                - Delay Reasons: {reasons_text}
                - Expected Delay: {expected_delay}
                - Updated Estimated Delivery Time: {eta}

                Return ONLY a JSON object with keys "subject" and "body". Do NOT wrap in extra codeblocks.
                """
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt
                )
                parsed = self._clean_and_parse_json(response.text)
                if parsed and "subject" in parsed and "body" in parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"Failed to generate email via Gemini: {e}. Using fallback email generator.")

        # Fallback professional email template
        subject = f"Shipment Delay Update - {shipment_dict.get('shipment_id')}"
        body = (
            f"Dear {customer_name},\n\n"
            f"Our AI monitoring system (SupplySync AI) has identified a possible delay for your shipment "
            f"({shipment_dict.get('shipment_id')}) due to {reasons_text}.\n\n"
            f"Your new estimated delivery time is approximately {eta} (expected delay: {expected_delay}).\n\n"
            f"We apologize for any inconvenience caused and are actively optimizing the remaining route to minimize delay.\n\n"
            f"Regards,\n"
            f"SupplySync AI Autonomous Logistics Operations"
        )
        return {"subject": subject, "body": body}

    def _build_prompt(self, s: Dict[str, Any]) -> str:
        return f"""
        Act as a senior Logistics & Supply Chain Risk Prediction Expert for SupplySync AI.
        Analyze all available shipment parameters simultaneously to predict delivery risk BEFORE delays occur:

        - Shipment ID: {s.get('shipment_id')}
        - Customer: {s.get('customer_name')} ({s.get('customer_email')})
        - Route: From {s.get('source')} to {s.get('destination')} (Current Location: {s.get('current_location')})
        - Remaining Distance: {s.get('distance_remaining')} km
        - Scheduled ETA: {s.get('expected_delivery_time')}
        - Traffic Status: {s.get('traffic')}
        - Weather Condition: {s.get('weather')}
        - Vehicle Health: {s.get('vehicle_health')}
        - Driver Status: {s.get('driver_status')}
        - Historical Delay Context: {s.get('historical_delay_info', 'None')}

        Evaluate the cumulative impact of traffic, weather, vehicle issues, driver availability, and distance.

        Respond strictly with valid JSON matching this exact structure:
        {{
            "shipment_id": "{s.get('shipment_id')}",
            "risk_score": <number 0-100>,
            "risk_level": "<Low | Medium | High>",
            "predicted_issue": "Delivery Delay",
            "expected_delay": "<e.g. 45 minutes or No Delay>",
            "reason": [
                "<Reason 1>",
                "<Reason 2>"
            ],
            "recommended_action": [
                "<Recommended Action 1>",
                "<Recommended Action 2>"
            ],
            "confidence_score": <number 0.80 to 0.99>
        }}
        Do not include Markdown triple backticks. Return valid raw JSON only.
        """

    def _clean_and_parse_json(self, raw_text: str) -> Dict[str, Any]:
        """Strip markdown code fencing if present and parse JSON."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        try:
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"JSON parsing error for response: {cleaned}. Exception: {e}")
            return None

    def _heuristic_ai_risk_analysis(self, s: Dict[str, Any]) -> Dict[str, Any]:
        """
        Advanced Multi-Factor Risk Reasoning Engine.
        Used as fallback when Gemini API key is not present or API call fails.
        Calculates risk score based on weighted logistics factors.
        """
        base_score = 10
        reasons = []
        actions = []
        total_delay_mins = 0

        # Traffic Factor
        traffic = str(s.get("traffic", "")).lower()
        if "heavy" in traffic or "gridlock" in traffic or "severe" in traffic:
            base_score += 35
            reasons.append("Heavy Traffic Congestion along route")
            actions.append("Reroute via alternate express highway")
            total_delay_mins += 30
        elif "moderate" in traffic or "medium" in traffic:
            base_score += 15
            reasons.append("Moderate Traffic slowdowns")
            total_delay_mins += 10

        # Weather Factor
        weather = str(s.get("weather", "")).lower()
        if "storm" in weather or "thunderstorm" in weather or "heavy rain" in weather:
            base_score += 35
            reasons.append(f"Severe Weather Conditions ({s.get('weather')})")
            actions.append("Reduce vehicle speed for driver safety")
            total_delay_mins += 35
        elif "rain" in weather or "fog" in weather or "snow" in weather:
            base_score += 25
            reasons.append(f"Adverse Weather ({s.get('weather')}) affecting visibility")
            actions.append("Monitor weather radar and update route")
            total_delay_mins += 20

        # Vehicle Health Factor
        vehicle = str(s.get("vehicle_health", "")).lower()
        if "warning" in vehicle or "engine" in vehicle or "overheating" in vehicle or "faulty" in vehicle:
            base_score += 30
            reasons.append(f"Vehicle Health Alert ({s.get('vehicle_health')})")
            actions.append("Dispatch mobile maintenance service & prioritize repair")
            total_delay_mins += 40
        elif "tire" in vehicle:
            base_score += 15
            reasons.append("Minor Vehicle Maintenance Warning")
            total_delay_mins += 15

        # Driver Status Factor
        driver = str(s.get("driver_status", "")).lower()
        if "rest" in driver or "overtime" in driver or "delayed" in driver:
            base_score += 20
            reasons.append(f"Driver Availability Constraint ({s.get('driver_status')})")
            actions.append("Assign secondary driver or schedule mandated rest break")
            total_delay_mins += 25

        # Distance Factor
        dist = float(s.get("distance_remaining", 0))
        if dist > 200:
            base_score += 10
            reasons.append(f"Long Remaining Distance ({dist} km)")

        # Cap score between 0 and 99
        risk_score = min(max(base_score, 5), 98)

        if risk_score >= 70:
            risk_level = "High"
            actions.append("Notify Customer immediately of expected delay")
            actions.append("Increase Delivery Priority in logistics queue")
        elif risk_score >= 40:
            risk_level = "Medium"
            actions.append("Monitor shipment checkpoints closely")
        else:
            risk_level = "Low"
            reasons = ["Optimal transit conditions", "All systems operational"]
            actions = ["Maintain current trajectory"]
            total_delay_mins = 0

        expected_delay_str = f"{total_delay_mins} minutes" if total_delay_mins > 0 else "No Delay"

        return {
            "shipment_id": s.get("shipment_id"),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "predicted_issue": "Delivery Delay" if risk_score >= 40 else "None",
            "expected_delay": expected_delay_str,
            "reason": list(set(reasons)),
            "recommended_action": list(set(actions)),
            "confidence_score": 0.92
        }


# Global instance
gemini_service = GeminiService()
