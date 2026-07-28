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

class RecommendResponse(BaseModel):
    recommendedShipment: Optional[ShipmentBase]
    otherShipments: List[ShipmentBase]
