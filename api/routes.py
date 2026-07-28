import json
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models.shipment import ShipmentData, ShipmentUpdate
from models.prediction import RiskPrediction
from models.feasibility import FeasibilityCheckRequest, FeasibilityCheckResponse
from agents.risk_agent import risk_prediction_agent
from agents.feasibility_agent import feasibility_agent
from services.db_service import db_service

logger = logging.getLogger("supplysync.api")
router = APIRouter(prefix="/api", tags=["Logistics Risk Agent"])


@router.post("/feasibility-check", response_model=FeasibilityCheckResponse)
def check_route_feasibility_and_dispatch(request: FeasibilityCheckRequest):
    """
    Dynamically check route feasibility for shipping a product from Source to Destination.
    Automatically assesses weather, traffic, product specifications, calculates risk/feasibility score,
    dispatches email notification to the customer, and logs shipment in SQLite database.
    """
    try:
        response = feasibility_agent.analyze_route_and_dispatch(request)
        return response
    except Exception as e:
        logger.error(f"Error in check_route_feasibility_and_dispatch: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict", response_model=RiskPrediction)
def predict_shipment_risk(shipment: ShipmentData):
    """
    Run autonomous risk prediction for a shipment payload.
    If risk score >= threshold (70%), automatically triggers Customer Communication Agent.
    """
    try:
        prediction = risk_prediction_agent.predict_and_act(shipment)
        return prediction
    except Exception as e:
        logger.error(f"Error in predict_shipment_risk: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/all", response_model=List[RiskPrediction])
def predict_all_shipments():
    """
    Run batch risk prediction across all registered logistics shipments.
    """
    shipment_rows = db_service.get_all_shipments()
    predictions = []
    for row in shipment_rows:
        shipment = ShipmentData(**row)
        pred = risk_prediction_agent.predict_and_act(shipment)
        predictions.append(pred)
    return predictions


@router.post("/predict/{shipment_id}", response_model=RiskPrediction)
def predict_by_id(shipment_id: str):
    """
    Run risk prediction for a specific shipment ID registered in SQLite.
    """
    shipment_dict = db_service.get_shipment(shipment_id)
    if not shipment_dict:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found.")

    shipment = ShipmentData(**shipment_dict)
    prediction = risk_prediction_agent.predict_and_act(shipment)
    return prediction


@router.get("/shipments", response_model=List[ShipmentData])
def get_all_shipments():
    """
    Get all registered logistics shipments.
    """
    rows = db_service.get_all_shipments()
    return [ShipmentData(**r) for r in rows]


@router.post("/shipments", response_model=ShipmentData)
def create_shipment(shipment: ShipmentData):
    """
    Register a new shipment in SupplySync AI platform.
    """
    db_service.upsert_shipment(shipment.model_dump())
    return shipment


@router.put("/shipments/{shipment_id}", response_model=ShipmentData)
def update_shipment_conditions(shipment_id: str, update_data: ShipmentUpdate):
    """
    Update live parameters (traffic, weather, vehicle health, driver status) for simulation testing.
    """
    existing = db_service.get_shipment(shipment_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found.")

    # Apply updates
    update_dict = update_data.model_dump(exclude_unset=True)
    existing.update(update_dict)

    updated_shipment = ShipmentData(**existing)
    db_service.upsert_shipment(updated_shipment.model_dump())
    return updated_shipment


@router.get("/predictions")
def get_prediction_history(shipment_id: Optional[str] = Query(None), limit: int = Query(50)):
    """
    Retrieve stored prediction history logs from SQLite database.
    """
    history = db_service.get_prediction_history(shipment_id=shipment_id, limit=limit)
    return history


@router.get("/predictions/{shipment_id}")
def get_prediction_history_by_id(shipment_id: str, limit: int = Query(50)):
    """
    Retrieve stored prediction history logs for a specific shipment ID from SQLite database.
    """
    history = db_service.get_prediction_history(shipment_id=shipment_id, limit=limit)
    if not history:
        return []
    return history
