import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from models.shipment import ShipmentData
from models.prediction import RiskPrediction, EmailContent
from services.gemini_service import gemini_service
from services.weather_service import weather_service
from services.traffic_service import traffic_service
from services.db_service import db_service
from agents.customer_communication_agent import customer_agent

logger = logging.getLogger("supplysync.risk_agent")


class RiskPredictionAgent:
    """
    Autonomous AI Risk Prediction Agent for SupplySync AI.
    Continuously analyzes multi-factor logistics data, predicts delivery delay risk using Gemini LLM,
    evaluates configurable thresholds (default 70%), and autonomously triggers action.
    """

    def __init__(self):
        self.threshold = int(os.getenv("RISK_THRESHOLD", "70"))
        self.gemini = gemini_service
        self.weather_svc = weather_service
        self.traffic_svc = traffic_service
        self.db = db_service
        self.comm_agent = customer_agent

    def predict_and_act(self, shipment: ShipmentData) -> RiskPrediction:
        """
        Full autonomous workflow:
        Collect weather -> Collect traffic -> Gemini reasoning -> Risk Score -> Threshold evaluation -> Autonomous action -> DB log
        """
        logger.info(f"Starting Risk Analysis for Shipment ID: {shipment.shipment_id}")

        # Step 1: Collect auxiliary weather & traffic metrics
        weather_info = self.weather_svc.get_weather_conditions(shipment.current_location, shipment.weather)
        traffic_info = self.traffic_svc.get_traffic_conditions(shipment.current_location, shipment.destination, shipment.traffic)

        shipment_dict = shipment.model_dump()
        # Enrich dict with collector details
        shipment_dict["weather_details"] = weather_info
        shipment_dict["traffic_details"] = traffic_info

        # Step 2: Query Gemini AI reasoning model for risk prediction
        raw_prediction = self.gemini.analyze_shipment_risk(shipment_dict)

        risk_score = raw_prediction.get("risk_score", 0)
        risk_level = raw_prediction.get("risk_level", "Low")
        predicted_issue = raw_prediction.get("predicted_issue", "Delivery Delay")
        expected_delay = raw_prediction.get("expected_delay", "No Delay")
        reasons = raw_prediction.get("reason", [])
        recommended_actions = raw_prediction.get("recommended_action", [])
        confidence = raw_prediction.get("confidence_score", 0.92)

        timestamp_now = datetime.now(timezone.utc).isoformat()

        # Step 3: Decision Logic Threshold Evaluation (Score >= 70)
        email_content: EmailContent = None
        customer_notified = False
        action_taken = "Monitored - No Action Required"

        if risk_score >= self.threshold:
            logger.warning(
                f"HIGH RISK DETECTED for {shipment.shipment_id}! "
                f"Risk Score {risk_score} >= Threshold {self.threshold}. "
                f"Autonomously invoking CustomerCommunicationAgent..."
            )
            # Autonomously trigger Customer Communication Agent
            email_content = self.comm_agent.notify_customer_of_delay(shipment, raw_prediction)
            customer_notified = True
            action_taken = "Customer Notified via Email (Autonomous Action Triggered)"
        else:
            logger.info(
                f"Shipment {shipment.shipment_id} Risk Score {risk_score} < Threshold {self.threshold}. "
                f"Continuing automated monitoring."
            )

        # Build final RiskPrediction object
        prediction_obj = RiskPrediction(
            shipment_id=shipment.shipment_id,
            risk_score=risk_score,
            risk_level=risk_level,
            predicted_issue=predicted_issue,
            expected_delay=expected_delay,
            reason=reasons,
            recommended_action=recommended_actions,
            confidence_score=confidence,
            action_taken=action_taken,
            customer_notified=customer_notified,
            email_content=email_content,
            timestamp=timestamp_now
        )

        # Step 4: Store Shipment & Prediction in SQLite
        try:
            self.db.upsert_shipment(shipment_dict)
            self.db.save_prediction(prediction_obj.model_dump())
        except Exception as e:
            logger.error(f"Failed to log prediction to SQLite: {e}", exc_info=True)

        return prediction_obj


# Global instance
risk_prediction_agent = RiskPredictionAgent()
