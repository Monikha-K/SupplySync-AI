from fastapi import APIRouter
from typing import List
import datetime
from app.schemas.shipment import RecommendRequest, RecommendResponse, AcceptRequest
from app.services import shipment_service

router = APIRouter()

@router.get("/sources", response_model=List[str])
async def get_sources():
    return await shipment_service.get_sources()

@router.get("/destinations", response_model=List[str])
async def get_destinations():
    return await shipment_service.get_destinations()

from app.schemas.shipment import RecommendRequest, RecommendResponse, AcceptRequest

@router.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    return await shipment_service.recommend_shipments(req.source, req.destination)

@router.put("/{shipmentId}/accept")
async def accept_shipment(shipmentId: str, req: AcceptRequest = None):
    data = req.dict(exclude_unset=True) if req else {}
    return await shipment_service.accept_shipment(shipmentId, data)

@router.get("/recommendations/top")
async def get_top_recommendations():
    # Helper to just return some dummy/generic top recommendations without source/dest 
    # Or just wrap the existing logic for a default pair for demonstration.
    return await shipment_service.recommend_shipments("Mumbai", "Delhi")

@router.get("/recommendations/report/{shipmentId}")
async def get_recommendation_report(shipmentId: str):
    # This would ideally fetch the shipment and run the engine on it to generate a standalone report.
    # We can mock this by running the scoring engine just for this one shipment if it exists.
    from app.database.mongodb import mongodb
    from app.config.config import settings
    from app.services.recommendation import recommendation_engine
    from fastapi import HTTPException
    
    shipment = await mongodb.db[settings.COLLECTION_NAME].find_one({"shipmentId": shipmentId})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    score = recommendation_engine.calculate_score(shipment)
    confidence = recommendation_engine.calculate_confidence(shipment)
    reasons = recommendation_engine.generate_reasons(shipment, score, is_selected=True)
    
    return {
        "shipmentId": shipmentId,
        "organization": shipment.get("organizationName"),
        "score": score,
        "confidence": confidence,
        "reasons": reasons,
        "rejectedAlternatives": [],
        "generatedTime": datetime.datetime.utcnow().isoformat()
    }
