from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CompletedShipmentSummary(BaseModel):
    """Lightweight card data returned by GET /api/insights/completed."""
    shipmentId: str
    organizationName: str
    source: str
    destination: str
    status: str
    completedAt: Optional[str] = None


class ShipmentReport(BaseModel):
    """Full logistics report returned by GET /api/insights/report/{shipmentId}."""
    shipmentId: str
    organizationName: str
    source: str
    destination: str
    vehicleType: str
    shipmentWeight: float
    distanceKm: float
    plannedETA: float
    actualTravelTime: float
    delayMinutes: float
    performanceScore: int
    deliveryStatus: str
    simulationEvents: List[str] = []
    recommendations: List[str] = []
