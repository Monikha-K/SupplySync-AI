import unittest
from fastapi.testclient import TestClient
from main import app, on_startup

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        on_startup()
        self.client = TestClient(app)

    def test_get_root(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_get_shipments(self):
        response = self.client.get("/api/shipments")
        self.assertEqual(response.status_code, 200)
        shipments = response.json()
        self.assertGreaterEqual(len(shipments), 1)

    def test_predict_shipment(self):
        response = self.client.post("/api/predict/SHIP001")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["shipment_id"], "SHIP001")
        self.assertIn("risk_score", data)

    def test_update_and_predict_simulation(self):
        # Update SHIP002 to heavy traffic and rain
        update_res = self.client.put("/api/shipments/SHIP002", json={
            "traffic": "Heavy",
            "weather": "Storm"
        })
        self.assertEqual(update_res.status_code, 200)

        # Predict risk for SHIP002
        pred_res = self.client.post("/api/predict/SHIP002")
        self.assertEqual(pred_res.status_code, 200)
        pred_data = pred_res.json()
        self.assertGreaterEqual(pred_data["risk_score"], 70)
        self.assertTrue(pred_data["customer_notified"])

    def test_get_predictions_history(self):
        response = self.client.get("/api/predictions")
        self.assertEqual(response.status_code, 200)
        history = response.json()
        self.assertGreaterEqual(len(history), 1)

if __name__ == "__main__":
    unittest.main()
