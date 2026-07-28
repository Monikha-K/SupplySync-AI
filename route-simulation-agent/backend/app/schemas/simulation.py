from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class Location(BaseModel):
    lat: float
    lng: float

class SimulationEvent(BaseModel):
    event: str

class StartSimulationRequest(BaseModel):
    shipmentId: str
    simulationSpeedStr: Optional[str] = "Normal"
    simulationMode: Optional[str] = "Normal Journey"
    checkpointInterval: Optional[str] = "25 km"
    animationSpeed: Optional[str] = "Medium"

class SimulationBase(BaseModel):
    simulationId: str
    shipmentId: str
    organizationName: str
    source: str
    destination: str
    distanceKm: float
    averageETAHours: float
    progress: float = 0
    remainingDistance: float
    remainingETA: float
    status: str = "Accepted"
    simulationSpeed: float = 1.0
    currentCheckpoint: int = 0
    currentLocation: Optional[Location] = None
    routeCoordinates: List[List[float]] = []
    activeEvent: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

class CompleteSimulationRequest(BaseModel):
    actualTravelTime: Optional[float] = None
    simulationEvents: Optional[List[str]] = None
    simulationSpeed: Optional[Any] = None

