from fastapi import APIRouter
from typing import List
from app.schemas.shipment import RecommendRequest, RecommendResponse
from app.services import shipment_service

router = APIRouter()

@router.get("/sources", response_model=List[str])
async def get_sources():
    return await shipment_service.get_sources()

@router.get("/destinations", response_model=List[str])
async def get_destinations():
    return await shipment_service.get_destinations()

@router.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    return await shipment_service.recommend_shipments(req.source, req.destination)

@router.put("/{shipmentId}/accept")
async def accept_shipment(shipmentId: str):
    return await shipment_service.accept_shipment(shipmentId)
