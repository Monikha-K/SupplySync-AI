from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ShipmentBase(BaseModel):
    shipmentId: str
    organizationName: str
    organizationRating: float
    source: str
    destination: str
    distanceKm: float
    averageETAHours: float
    vehicleType: str
    shipmentWeight: float
    status: str
    createdAt: datetime
    updatedAt: datetime

class RecommendRequest(BaseModel):
    source: str
    destination: str

from typing import Any, Dict

class RecommendResponse(BaseModel):
    totalShipments: int
    eligibleShipments: int
    rejectedShipments: int
    rejectedDetails: List[Dict[str, Any]]
    recommendedShipment: Optional[Dict[str, Any]]
    otherShipments: List[Dict[str, Any]]

class AcceptRequest(BaseModel):
    recommendationScore: Optional[float] = None
    confidenceScore: Optional[float] = None
    decisionReasons: Optional[List[str]] = None
    comparisonRank: Optional[int] = None
