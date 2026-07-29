from app.database.mongodb import mongodb
from app.config.config import settings
from fastapi import HTTPException
import datetime
from app.services.recommendation import recommendation_engine

from fastapi.responses import JSONResponse

async def get_sources():
    if mongodb.db is None:
        return JSONResponse(status_code=500, content={"success": False, "error": "Database connection not initialized"})
    try:
        districts = await mongodb.db[settings.COLLECTION_NAME].distinct("source")
        return districts
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": f"Database error: {str(e)}"})

async def get_destinations():
    if mongodb.db is None:
        return JSONResponse(status_code=500, content={"success": False, "error": "Database connection not initialized"})
    try:
        districts = await mongodb.db[settings.COLLECTION_NAME].distinct("destination")
        return districts
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": f"Database error: {str(e)}"})

async def recommend_shipments(source: str, destination: str):
    if source == destination:
        return JSONResponse(status_code=400, content={"success": False, "error": "Source and destination cannot be the same"})
    
    if mongodb.db is None:
        return JSONResponse(status_code=500, content={"success": False, "error": "Database connection not initialized"})
    
    try:
        cursor = mongodb.db[settings.COLLECTION_NAME].find({
            "source": source,
            "destination": destination
        })
        all_shipments = await cursor.to_list(length=100)
        
        # Convert ObjectId to string
        for shipment in all_shipments:
            if "_id" in shipment:
                shipment["_id"] = str(shipment["_id"])
                
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": f"Database error: {str(e)}"})
    
    if not all_shipments:
        return {
            "eligibleShipments": 0,
            "rejectedShipments": 0,
            "recommendedShipment": None,
            "otherShipments": []
        }

    # 2. Validation Engine
    eligible = []
    rejected_list = []
    for shipment in all_shipments:
        # Avoid already accepted shipments here as well
        if shipment.get("status") == "Accepted":
            is_valid, reason = False, "Shipment already accepted"
        else:
            is_valid, reason = recommendation_engine.validate_shipment(shipment)
            
        if is_valid:
            eligible.append(shipment)
        else:
            rejected_list.append({
                "shipmentId": shipment.get("shipmentId", "UNKNOWN"),
                "reason": reason
            })

    if not eligible:
        return {
            "eligibleShipments": 0,
            "rejectedShipments": len(rejected_list),
            "rejectedDetails": rejected_list,
            "recommendedShipment": None,
            "otherShipments": []
        }

    # 3. Scoring Engine
    scored_shipments = []
    for shipment in eligible:
        score = recommendation_engine.calculate_score(shipment)
        confidence = recommendation_engine.calculate_confidence(shipment)
        scored_shipments.append({
            "shipment": shipment,
            "score": score,
            "confidence": confidence
        })

    # 4. Compare and Sort
    scored_shipments.sort(key=lambda x: x["score"], reverse=True)
    
    # 5. Recommendation and Explainability
    best_candidate = scored_shipments[0]
    best_candidate["reasons"] = recommendation_engine.generate_reasons(
        best_candidate["shipment"], best_candidate["score"], is_selected=True
    )
    
    # Prepare top recommended shipment for output
    recommended_out = {
        **best_candidate["shipment"],
        "recommendationScore": best_candidate["score"],
        "confidenceScore": best_candidate["confidence"],
        "decisionReasons": best_candidate["reasons"],
        "comparisonRank": 1
    }

    # Prepare alternatives
    others_out = []
    for idx, candidate in enumerate(scored_shipments[1:]):
        reasons = recommendation_engine.generate_reasons(
            candidate["shipment"], candidate["score"], is_selected=False
        )
        others_out.append({
            **candidate["shipment"],
            "recommendationScore": candidate["score"],
            "confidenceScore": candidate["confidence"],
            "decisionReasons": reasons,
            "comparisonRank": idx + 2
        })

    return {
        "totalShipments": len(all_shipments),
        "eligibleShipments": len(eligible),
        "rejectedShipments": len(rejected_list),
        "rejectedDetails": rejected_list,
        "recommendedShipment": recommended_out,
        "otherShipments": others_out[:4] # Top 5 total (1 recommended + 4 others)
    }

async def accept_shipment(shipment_id: str, recommendation_data: dict = None):
    if mongodb.db is None:
        return JSONResponse(status_code=500, content={"success": False, "error": "Database connection not initialized"})
        
    try:
        shipment = await mongodb.db[settings.COLLECTION_NAME].find_one({"shipmentId": shipment_id})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": f"Database error: {str(e)}"})
        
    if not shipment:
        return JSONResponse(status_code=404, content={"success": False, "error": "Shipment not found"})
        
    if shipment["status"] != "Available":
        return JSONResponse(status_code=409, content={"success": False, "error": "Shipment is not available"})
        
    try:
        # Check if already in accepted_shipments
        existing_accepted = await mongodb.db[settings.ACCEPTED_SHIPMENTS_COLLECTION].find_one({"shipmentId": shipment_id})
        if existing_accepted:
            return JSONResponse(status_code=409, content={"success": False, "error": "Shipment already accepted."})
            
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
        
        # Add Explainable AI Data
        if recommendation_data:
            accepted_doc["recommendationScore"] = recommendation_data.get("recommendationScore")
            accepted_doc["confidenceScore"] = recommendation_data.get("confidenceScore")
            accepted_doc["decisionReasons"] = recommendation_data.get("decisionReasons")
            accepted_doc["comparisonRank"] = recommendation_data.get("comparisonRank")
            accepted_doc["generatedAt"] = datetime.datetime.utcnow()
        
        await mongodb.db[settings.ACCEPTED_SHIPMENTS_COLLECTION].insert_one(accepted_doc)
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": f"Database error: {str(e)}"})
    
    return {
        "message": "Shipment Accepted Successfully",
        "shipmentId": shipment_id,
        "simulationReady": True
    }
