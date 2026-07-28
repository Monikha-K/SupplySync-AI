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
        
    await mongodb.db[settings.COLLECTION_NAME].update_one(
        {"shipmentId": shipment_id},
        {"$set": {"status": "Accepted", "updatedAt": datetime.datetime.utcnow()}}
    )
    
    updated_shipment = await mongodb.db[settings.COLLECTION_NAME].find_one({"shipmentId": shipment_id})
    updated_shipment.pop("_id", None)
    return updated_shipment
