from fastapi import APIRouter, HTTPException
from app.database.mongodb import get_database
from app.config.config import settings
from app.services.recommendation_engine import generate_recommendations

router = APIRouter()


@router.get("/completed")
async def get_completed_shipments():
    """Return every completed shipment (lightweight summary for cards)."""
    try:
        db = get_database()
        col = db[settings.SIMULATIONS_COLLECTION]
        cursor = col.find({"status": "Completed"}).sort("completedAt", -1)
        docs = await cursor.to_list(length=200)

        results = []
        for doc in docs:
            completed_at = doc.get("completedAt")
            if completed_at:
                completed_at = str(completed_at)

            results.append({
                "shipmentId": doc.get("shipmentId", ""),
                "organizationName": doc.get("organizationName", "Unknown"),
                "source": doc.get("source", ""),
                "destination": doc.get("destination", ""),
                "status": doc.get("status", "Completed"),
                "completedAt": completed_at,
            })

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.get("/report/{shipmentId}")
async def get_shipment_report(shipmentId: str):
    """Generate a full logistics report for a completed shipment."""
    try:
        db = get_database()
        col = db[settings.SIMULATIONS_COLLECTION]

        doc = await col.find_one(
            {"shipmentId": shipmentId, "status": "Completed"},
            sort=[("completedAt", -1)],
        )

        if not doc:
            raise HTTPException(
                status_code=404,
                detail=f"Completed shipment '{shipmentId}' not found.",
            )

        delay_minutes = float(doc.get("delayMinutes", 0))
        performance_score = int(doc.get("performanceScore", 0))
        simulation_events = doc.get("simulationEvents", [])

        recommendations = generate_recommendations(
            delay_minutes=delay_minutes,
            performance_score=performance_score,
            simulation_events=simulation_events,
        )

        return {
            "shipmentId": doc.get("shipmentId", ""),
            "organizationName": doc.get("organizationName", "Unknown"),
            "source": doc.get("source", ""),
            "destination": doc.get("destination", ""),
            "vehicleType": doc.get("vehicleType", "Unknown"),
            "shipmentWeight": float(doc.get("shipmentWeight", 0)),
            "distanceKm": float(doc.get("distanceKm", 0)),
            "plannedETA": float(doc.get("plannedETA", 0)),
            "actualTravelTime": float(doc.get("actualTravelTime", 0)),
            "delayMinutes": delay_minutes,
            "performanceScore": performance_score,
            "deliveryStatus": "Delivered",
            "simulationEvents": simulation_events,
            "recommendations": recommendations,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
