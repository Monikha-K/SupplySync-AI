import sqlite3
import json
import logging
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.getenv("SQLITE_DB_PATH", "supplysync_risk.db")
logger = logging.getLogger("supplysync.db_service")


class DatabaseService:
    """SQLite Database manager for SupplySync AI Risk Prediction Agent."""

    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initialize SQLite tables for shipments and prediction logs."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                # Create shipments table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS shipments (
                        shipment_id TEXT PRIMARY KEY,
                        customer_name TEXT NOT NULL,
                        customer_email TEXT NOT NULL,
                        source TEXT NOT NULL,
                        destination TEXT NOT NULL,
                        current_location TEXT NOT NULL,
                        distance_remaining REAL NOT NULL,
                        expected_delivery_time TEXT NOT NULL,
                        traffic TEXT NOT NULL,
                        weather TEXT NOT NULL,
                        vehicle_health TEXT NOT NULL,
                        driver_status TEXT NOT NULL,
                        historical_delay_info TEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                # Create predictions history table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS predictions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        shipment_id TEXT NOT NULL,
                        risk_score INTEGER NOT NULL,
                        risk_level TEXT NOT NULL,
                        predicted_issue TEXT NOT NULL,
                        expected_delay TEXT NOT NULL,
                        reasons_json TEXT NOT NULL,
                        actions_json TEXT NOT NULL,
                        confidence_score REAL NOT NULL,
                        action_taken TEXT NOT NULL,
                        customer_notified INTEGER NOT NULL,
                        email_json TEXT,
                        timestamp TEXT NOT NULL,
                        FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id)
                    );
                """)
                conn.commit()
                logger.info(f"Database initialized successfully at {self.db_path}")
        except Exception as e:
            logger.error(f"Error initializing SQLite database: {e}", exc_info=True)
            raise

    def upsert_shipment(self, shipment_data: Dict[str, Any]):
        """Insert or update a shipment in SQLite."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO shipments (
                    shipment_id, customer_name, customer_email, source, destination,
                    current_location, distance_remaining, expected_delivery_time,
                    traffic, weather, vehicle_health, driver_status, historical_delay_info
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(shipment_id) DO UPDATE SET
                    customer_name=excluded.customer_name,
                    customer_email=excluded.customer_email,
                    source=excluded.source,
                    destination=excluded.destination,
                    current_location=excluded.current_location,
                    distance_remaining=excluded.distance_remaining,
                    expected_delivery_time=excluded.expected_delivery_time,
                    traffic=excluded.traffic,
                    weather=excluded.weather,
                    vehicle_health=excluded.vehicle_health,
                    driver_status=excluded.driver_status,
                    historical_delay_info=excluded.historical_delay_info,
                    updated_at=CURRENT_TIMESTAMP;
            """, (
                shipment_data["shipment_id"],
                shipment_data["customer_name"],
                shipment_data["customer_email"],
                shipment_data["source"],
                shipment_data["destination"],
                shipment_data["current_location"],
                shipment_data["distance_remaining"],
                shipment_data["expected_delivery_time"],
                shipment_data["traffic"],
                shipment_data["weather"],
                shipment_data["vehicle_health"],
                shipment_data["driver_status"],
                shipment_data.get("historical_delay_info")
            ))
            conn.commit()

    def get_shipment(self, shipment_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve shipment details by shipment_id."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None

    def get_all_shipments(self) -> List[Dict[str, Any]]:
        """Retrieve all active shipments."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM shipments ORDER BY shipment_id ASC")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def save_prediction(self, prediction_data: Dict[str, Any]):
        """Store a prediction record in the SQLite history database."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO predictions (
                    shipment_id, risk_score, risk_level, predicted_issue, expected_delay,
                    reasons_json, actions_json, confidence_score, action_taken,
                    customer_notified, email_json, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                prediction_data["shipment_id"],
                prediction_data["risk_score"],
                prediction_data["risk_level"],
                prediction_data.get("predicted_issue", "Delivery Delay"),
                prediction_data["expected_delay"],
                json.dumps(prediction_data.get("reason", [])),
                json.dumps(prediction_data.get("recommended_action", [])),
                prediction_data.get("confidence_score", 0.9),
                prediction_data.get("action_taken", "Monitored"),
                1 if prediction_data.get("customer_notified") else 0,
                json.dumps(prediction_data.get("email_content")) if prediction_data.get("email_content") else None,
                prediction_data["timestamp"]
            ))
            conn.commit()
            logger.info(f"Prediction logged for shipment {prediction_data['shipment_id']} with score {prediction_data['risk_score']}")

    def get_prediction_history(self, shipment_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve prediction history logs."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if shipment_id:
                cursor.execute("""
                    SELECT * FROM predictions
                    WHERE shipment_id = ?
                    ORDER BY id DESC LIMIT ?
                """, (shipment_id, limit))
            else:
                cursor.execute("""
                    SELECT * FROM predictions
                    ORDER BY id DESC LIMIT ?
                """, (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["reason"] = json.loads(item["reasons_json"]) if item.get("reasons_json") else []
                item["recommended_action"] = json.loads(item["actions_json"]) if item.get("actions_json") else []
                item["customer_notified"] = bool(item.get("customer_notified", 0))
                if item.get("email_json"):
                    item["email_content"] = json.loads(item["email_json"])
                else:
                    item["email_content"] = None
                results.append(item)
            return results


# Global singleton instance
db_service = DatabaseService()
