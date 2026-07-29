from fastapi import APIRouter
from datetime import datetime, timezone
from models.assignment import AssignmentRequest
from database import assignments_collection

router = APIRouter()

def generate_shipment_id() -> str:
    count = assignments_collection.count_documents({})
    return f"SHIP-{str(count + 1).zfill(6)}"

@router.post("/assign-driver")
def assign_driver(payload: AssignmentRequest):
    shipment_id = generate_shipment_id()

    document = {
        "shipment_id": shipment_id,
        "driver_id": payload.driver_id,
        "driver_name": payload.driver_name,
        "pickup_city": payload.pickup_city,
        "drop_city": payload.drop_city,
        "cargo_type": payload.cargo_type,
        "weight": payload.weight,
        "priority": payload.priority,
        "recommendation_reason": payload.recommendation_reason,
        "assigned_at": datetime.now(timezone.utc).isoformat(),
        "status": "Assigned",
    }

    assignments_collection.insert_one(document)

    return {
        "success": True,
        "shipment_id": shipment_id,
        "message": "Driver assigned successfully.",
    }
