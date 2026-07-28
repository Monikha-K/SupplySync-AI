import os
import uuid
import logging
import math
from datetime import datetime, timezone
from typing import Dict, Any
from models.feasibility import FeasibilityCheckRequest, FeasibilityCheckResponse
from models.shipment import ShipmentData
from models.prediction import RiskPrediction, EmailContent
from services.gemini_service import gemini_service
from services.weather_service import weather_service
from services.traffic_service import traffic_service
from services.email_service import email_service
from services.db_service import db_service

logger = logging.getLogger("supplysync.feasibility_agent")


class AutonomousFeasibilityAgent:
    """
    Autonomous Agent for checking dynamic product transport feasibility from Source to Destination.
    Automatically assesses route traffic & weather, evaluates product handling risk (weight, fragile status),
    determines feasibility status, logs shipment to SQLite database, and automatically dispatches email updates.
    """

    def __init__(self):
        self.gemini = gemini_service
        self.weather_svc = weather_service
        self.traffic_svc = traffic_service
        self.email_svc = email_service
        self.db = db_service

    def analyze_route_and_dispatch(self, req: FeasibilityCheckRequest) -> FeasibilityCheckResponse:
        """
        Executes full end-to-end feasibility workflow:
        1. Auto-collects weather at Source and Destination
        2. Auto-collects route traffic congestion
        3. Estimates transit distance & baseline duration
        4. Runs AI reasoning engine (Gemini with intelligent fallback)
        5. Dispatches customer email notification with product details & route status
        6. Logs shipment and prediction record into SQLite database
        """
        logger.info(f"Starting Feasibility Check for Product '{req.product_name}' from {req.source} to {req.destination}")
        
        feasibility_id = f"FEAS-{uuid.uuid4().hex[:6].upper()}"
        shipment_id = f"SHIP-{uuid.uuid4().hex[:6].upper()}"

        # Step 1: Collect Route Conditions
        weather_source = self.weather_svc.get_weather_conditions(req.source)
        weather_dest = self.weather_svc.get_weather_conditions(req.destination)
        traffic_info = self.traffic_svc.get_traffic_conditions(req.source, req.destination)

        # Estimate distance & duration heuristics
        estimated_distance = self._estimate_distance(req.source, req.destination)
        base_speed_kmh = 60.0
        slowdown = traffic_info.get("slowdown_multiplier", 1.0)
        weather_multiplier = weather_dest.get("impact_delay_multiplier", 1.0)
        
        effective_speed = max(20.0, base_speed_kmh / (slowdown * weather_multiplier))
        estimated_hours = round(estimated_distance / effective_speed, 1)

        # Composite weather condition text
        weather_summary_text = f"Source ({req.source}): {weather_source.get('condition')}, Destination ({req.destination}): {weather_dest.get('condition')}"
        traffic_summary_text = traffic_info.get("traffic_status", "Light Traffic")

        # Step 2: AI Reasoning for Feasibility & Risk
        analysis = self._run_feasibility_ai_analysis(
            req=req,
            distance_km=estimated_distance,
            estimated_hours=estimated_hours,
            weather_source=weather_source,
            weather_dest=weather_dest,
            traffic_info=traffic_info
        )

        risk_score = analysis.get("risk_score", 30)
        risk_level = analysis.get("risk_level", "Low")
        is_feasible = analysis.get("is_feasible", True)
        feasibility_status = analysis.get("feasibility_status", "Feasible & Recommended")
        reasons = analysis.get("reasons", [])
        recommended_actions = analysis.get("recommended_actions", [])

        timestamp_now = datetime.now(timezone.utc).isoformat()

        # Step 3: Auto-generate & Dispatch Email to Customer
        email_content_obj: EmailContent = None
        customer_notified = False
        action_taken = "Feasibility Evaluated"

        try:
            email_data = self._generate_feasibility_email(
                req=req,
                feasibility_id=feasibility_id,
                status=feasibility_status,
                risk_score=risk_score,
                estimated_hours=estimated_hours,
                weather_text=weather_summary_text,
                traffic_text=traffic_summary_text,
                reasons=reasons
            )
            
            # Dispatch email via EmailService
            dispatch_res = self.email_svc.send_email(
                recipient_email=req.customer_email,
                subject=email_data["subject"],
                body=email_data["body"]
            )
            
            customer_notified = True
            email_content_obj = EmailContent(
                subject=email_data["subject"],
                body=email_data["body"],
                sent_at=timestamp_now,
                recipient=req.customer_email,
                status=dispatch_res.get("status", "Dispatched")
            )
            action_taken = "Feasibility Checked & Dispatch Email Sent to Customer"
        except Exception as e:
            logger.error(f"Error dispatching feasibility email: {e}", exc_info=True)
            action_taken = f"Feasibility Evaluated (Email Error: {str(e)})"

        # Step 4: Save to SQLite Database
        try:
            shipment_record = {
                "shipment_id": shipment_id,
                "customer_name": req.customer_name,
                "customer_email": req.customer_email,
                "source": req.source,
                "destination": req.destination,
                "current_location": req.source,
                "distance_remaining": float(estimated_distance),
                "expected_delivery_time": f"{estimated_hours} Hours Transit",
                "traffic": traffic_summary_text,
                "weather": weather_dest.get("condition", "Clear"),
                "vehicle_health": "Special Transport" if req.is_fragile or req.weight_kg > 500 else "Healthy",
                "driver_status": "Assigned",
                "historical_delay_info": f"Product: {req.product_name} ({req.weight_kg}kg, Fragile={req.is_fragile})"
            }
            self.db.upsert_shipment(shipment_record)

            prediction_record = RiskPrediction(
                shipment_id=shipment_id,
                risk_score=risk_score,
                risk_level=risk_level,
                predicted_issue=f"Feasibility: {feasibility_status}",
                expected_delay=f"{estimated_hours}h estimated transit",
                reason=reasons,
                recommended_action=recommended_actions,
                confidence_score=0.92,
                action_taken=action_taken,
                customer_notified=customer_notified,
                email_content=email_content_obj,
                timestamp=timestamp_now
            )
            self.db.save_prediction(prediction_record.model_dump())
        except Exception as db_err:
            logger.error(f"Failed to log feasibility shipment to SQLite: {db_err}", exc_info=True)

        return FeasibilityCheckResponse(
            feasibility_id=feasibility_id,
            is_feasible=is_feasible,
            feasibility_status=feasibility_status,
            risk_score=risk_score,
            risk_level=risk_level,
            estimated_distance_km=float(estimated_distance),
            estimated_transit_hours=float(estimated_hours),
            weather_summary={
                "source_weather": weather_source,
                "destination_weather": weather_dest,
                "summary": weather_summary_text
            },
            traffic_summary=traffic_info,
            product_summary={
                "product_name": req.product_name,
                "product_category": req.product_category,
                "weight_kg": req.weight_kg,
                "quantity": req.quantity,
                "is_fragile": req.is_fragile
            },
            reasons=reasons,
            recommended_actions=recommended_actions,
            action_taken=action_taken,
            customer_notified=customer_notified,
            email_content=email_content_obj,
            timestamp=timestamp_now
        )

    def _estimate_distance(self, source: str, destination: str) -> float:
        """Deterministic distance estimator based on location string hash."""
        comb = (source.lower().strip() + "-" + destination.lower().strip())
        h = sum(ord(c) for c in comb)
        dist = 180 + (h % 650)
        return float(dist)

    def _run_feasibility_ai_analysis(
        self, req: FeasibilityCheckRequest, distance_km: float, estimated_hours: float,
        weather_source: dict, weather_dest: dict, traffic_info: dict
    ) -> Dict[str, Any]:
        """Queries Gemini or uses heuristic engine to compute feasibility metrics."""

        if self.gemini.client:
            try:
                prompt = f"""
                Act as SupplySync AI's Chief Logistics & Route Feasibility Agent.
                Determine if shipping a product from {req.source} to {req.destination} is feasible given live route metrics and product specs.

                Shipment & Product Input:
                - Product: {req.product_name} (Category: {req.product_category})
                - Quantity: {req.quantity} | Weight: {req.weight_kg} kg | Fragile: {req.is_fragile}
                - Route: {req.source} ➔ {req.destination} (~{distance_km} km)
                - Weather at Source: {weather_source.get('condition')} (Severity: {weather_source.get('severity')})
                - Weather at Destination: {weather_dest.get('condition')} (Severity: {weather_dest.get('severity')})
                - Traffic Congestion: {traffic_info.get('traffic_status')} (Slowdown: {traffic_info.get('slowdown_multiplier')}x)
                - Estimated Transit Time: {estimated_hours} hours

                Evaluate risk score (0 to 100), feasibility (true/false), status label ("Feasible & Optimal", "Feasible with High Risk", "Infeasible - Extreme Delay"), reasons, and recommendations.

                Return strictly JSON:
                {{
                    "risk_score": <int 0-100>,
                    "risk_level": "<Low | Medium | High | Critical>",
                    "is_feasible": <true/false>,
                    "feasibility_status": "<Feasible & Optimal | Feasible with High Risk | Infeasible>",
                    "reasons": ["<reason 1>", "<reason 2>"],
                    "recommended_actions": ["<action 1>", "<action 2>"]
                }}
                """
                resp = self.gemini.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt
                )
                parsed = self.gemini._clean_and_parse_json(resp.text)
                if parsed and "risk_score" in parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini API check failed for feasibility: {e}. Executing AI fallback heuristic.")

        # Heuristic calculation fallback
        risk_score = 15
        reasons = []
        actions = []

        if traffic_info.get("traffic_status") in ["Heavy", "Gridlock"]:
            risk_score += 35
            reasons.append(f"Heavy traffic congestion reported along {req.source} to {req.destination} corridor")
            actions.append("Dispatch during off-peak hours (e.g. late night or early morning)")

        if weather_dest.get("severity") in ["High", "Medium-High"]:
            risk_score += 30
            reasons.append(f"Adverse weather ({weather_dest.get('condition')}) detected at destination {req.destination}")
            actions.append("Ensure waterproof / weather-sealed container packaging")

        if req.is_fragile:
            risk_score += 15
            reasons.append("Fragile product cargo requires air-cushioned vehicle suspension and speed limits")
            actions.append("Assign top-rated experienced driver with fragile cargo certification")

        if req.weight_kg > 500:
            risk_score += 10
            reasons.append(f"Heavy load ({req.weight_kg} kg) requires heavy-duty vehicle inspection")
            actions.append("Deploy multi-axle freight truck with hydraulic liftgate")

        risk_score = min(99, max(5, risk_score))
        if risk_score >= 70:
            risk_level = "High"
            is_feasible = True
            feasibility_status = "Feasible with High Risk"
        elif risk_score >= 40:
            risk_level = "Medium"
            is_feasible = True
            feasibility_status = "Feasible & Action Required"
        else:
            risk_level = "Low"
            is_feasible = True
            feasibility_status = "Feasible & Optimal"

        if not reasons:
            reasons.append("Route weather and traffic conditions are clear; standard transit approved.")
        if not actions:
            actions.append("Proceed with standard automated dispatch procedure.")

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "is_feasible": is_feasible,
            "feasibility_status": feasibility_status,
            "reasons": reasons,
            "recommended_actions": actions
        }

    def _generate_feasibility_email(
        self, req: FeasibilityCheckRequest, feasibility_id: str, status: str,
        risk_score: int, estimated_hours: float, weather_text: str, traffic_text: str, reasons: list
    ) -> Dict[str, str]:
        """Generates structured customer email notification."""
        reasons_bullet = "\n".join([f"• {r}" for r in reasons])
        fragile_str = "Yes (Special Handling Applied)" if req.is_fragile else "Standard"

        subject = f"SupplySync AI: Product Feasibility & Dispatch Confirmation [{feasibility_id}]"
        body = (
            f"Dear {req.customer_name},\n\n"
            f"SupplySync AI Autonomous Operations has completed the dynamic route feasibility inspection for your product shipment.\n\n"
            f"📦 SHIPMENT SPECIFICATIONS:\n"
            f"• Product: {req.product_name} (Qty: {req.quantity}, Weight: {req.weight_kg} kg)\n"
            f"• Handling Care: {fragile_str}\n"
            f"• Route: {req.source} ➔ {req.destination}\n"
            f"• Estimated Transit Duration: {estimated_hours} Hours\n\n"
            f"🌐 AUTONOMOUS ENVIRONMENT AUDIT:\n"
            f"• Route Traffic: {traffic_text}\n"
            f"• Weather Status: {weather_text}\n"
            f"• Route Risk Score: {risk_score}% ({status})\n\n"
            f"📋 AI EVALUATION REASONS:\n"
            f"{reasons_bullet}\n\n"
            f"Your order feasibility status is confirmed as '{status}'. Our autonomous dispatch agent has initiated transport preparation.\n\n"
            f"Best regards,\n"
            f"SupplySync AI Autonomous Logistics Operations"
        )
        return {"subject": subject, "body": body}


# Global instance
feasibility_agent = AutonomousFeasibilityAgent()
