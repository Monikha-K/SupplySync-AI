import os
import sys
import unittest
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models.shipment import ShipmentData
from models.prediction import RiskPrediction
from services.db_service import db_service
from services.weather_service import weather_service
from services.traffic_service import traffic_service
from services.gemini_service import gemini_service
from agents.risk_agent import risk_prediction_agent
from agents.customer_communication_agent import customer_agent


class TestSupplySyncRiskAgent(unittest.TestCase):

    def setUp(self):
        self.db = db_service

    def test_01_models_validation(self):
        shipment = ShipmentData(
            shipment_id="TEST001",
            customer_name="John Doe",
            customer_email="john@example.com",
            source="CityA",
            destination="CityB",
            current_location="Midway",
            distance_remaining=100.0,
            expected_delivery_time="5:00 PM",
            traffic="Light",
            weather="Clear",
            vehicle_health="Healthy",
            driver_status="Available"
        )
        self.assertEqual(shipment.shipment_id, "TEST001")
        self.assertEqual(shipment.distance_remaining, 100.0)

    def test_02_low_risk_prediction(self):
        low_risk_shipment = ShipmentData(
            shipment_id="TEST_LOW",
            customer_name="Alice Smith",
            customer_email="alice@example.com",
            source="Mumbai",
            destination="Pune",
            current_location="Lonavala",
            distance_remaining=30.0,
            expected_delivery_time="4:00 PM",
            traffic="Light",
            weather="Clear",
            vehicle_health="Healthy",
            driver_status="Available"
        )

        prediction: RiskPrediction = risk_prediction_agent.predict_and_act(low_risk_shipment)
        
        self.assertIsInstance(prediction, RiskPrediction)
        self.assertLess(prediction.risk_score, 70)
        self.assertFalse(prediction.customer_notified)
        self.assertIn("Monitored", prediction.action_taken)

    def test_03_high_risk_prediction_and_autonomous_action(self):
        high_risk_shipment = ShipmentData(
            shipment_id="TEST_HIGH",
            customer_name="Robert Johnson",
            customer_email="robert@example.com",
            source="Kolkata",
            destination="Bhubaneswar",
            current_location="Kharagpur",
            distance_remaining=250.0,
            expected_delivery_time="8:00 PM",
            traffic="Heavy",
            weather="Storm",
            vehicle_health="Engine Warning",
            driver_status="Rest Required"
        )

        prediction: RiskPrediction = risk_prediction_agent.predict_and_act(high_risk_shipment)

        self.assertIsInstance(prediction, RiskPrediction)
        self.assertGreaterEqual(prediction.risk_score, 70)
        self.assertTrue(prediction.customer_notified)
        self.assertIsNotNone(prediction.email_content)
        self.assertIn("Customer Notified", prediction.action_taken)
        self.assertIn("Robert", prediction.email_content.body)

    def test_04_sqlite_history_persistence(self):
        history = self.db.get_prediction_history(limit=10)
        self.assertGreater(len(history), 0)
        latest = history[0]
        self.assertIn("shipment_id", latest)
        self.assertIn("risk_score", latest)


if __name__ == "__main__":
    unittest.main()
