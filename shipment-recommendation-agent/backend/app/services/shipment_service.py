from app.database.mongodb import mongodb
from app.config.config import settings
from fastapi import HTTPException
import datetime

async def get_sources():
    districts = await mongodb.db[settings.COLLECTION_NAME].distinct("source")
    return districts

async def get_destinations():
    districts = await mongodb.db[settings.COLLECTION_NAME].distinct("destination")
    return districts

async def recommend_shipments(source: str, destination: str):
    if source == destination:
        raise HTTPException(status_code=400, detail="Source and destination cannot be the same")
    
    cursor = mongodb.db[settings.COLLECTION_NAME].find({
        "source": source,
        "destination": destination,
        "status": "Available"
    }).sort("organizationRating", -1)
    
    shipments = await cursor.to_list(length=100)
    
    if not shipments:
        return {"recommendedShipment": None, "otherShipments": []}
        
    recommended = shipments[0]
    others = shipments[1:]
    
    return {
        "recommendedShipment": recommended,
        "otherShipments": others
    }

async def accept_shipment(shipment_id: str):
    shipment = await mongodb.db[settings.COLLECTION_NAME].find_one({"shipmentId": shipment_id})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    if shipment["status"] != "Available":
        raise HTTPException(status_code=409, detail="Shipment is not available")
        
    # Check if already in accepted_shipments
    existing_accepted = await mongodb.db[settings.ACCEPTED_SHIPMENTS_COLLECTION].find_one({"shipmentId": shipment_id})
    if existing_accepted:
        raise HTTPException(status_code=409, detail="Shipment already accepted.")
        
    # Update shipment status
    await mongodb.db[settings.COLLECTION_NAME].update_one(
        {"shipmentId": shipment_id},
        {"$set": {"status": "Accepted", "updatedAt": datetime.datetime.utcnow()}}
    )
    
    # Create accepted_shipment document
    accepted_doc = {
        "shipmentId": shipment.get("shipmentId"),
        "organizationName": shipment.get("organizationName"),
        "organizationRating": shipment.get("organizationRating"),
        "source": shipment.get("source"),
        "destination": shipment.get("destination"),
        "distanceKm": shipment.get("distanceKm"),
        "averageETAHours": shipment.get("averageETAHours"),
        "vehicleType": shipment.get("vehicleType"),
        "shipmentWeight": shipment.get("shipmentWeight"),
        "status": "Accepted",
        "acceptedAt": datetime.datetime.utcnow(),
        "readyForSimulation": True,
        "simulationStatus": "Not Started"
    }
    
    await mongodb.db[settings.ACCEPTED_SHIPMENTS_COLLECTION].insert_one(accepted_doc)
    
    return {
        "message": "Shipment Accepted Successfully",
        "shipmentId": shipment_id,
        "simulationReady": True
    }
