from typing import Optional
from pydantic import BaseModel, Field


class ShipmentData(BaseModel):
    """Data model representing a logistics shipment state."""
    shipment_id: str = Field(..., description="Unique shipment identifier")
    customer_name: str = Field(..., description="Customer full name")
    customer_email: str = Field(..., description="Customer contact email")
    source: str = Field(..., description="Origin location")
    destination: str = Field(..., description="Destination location")
    current_location: str = Field(..., description="Current GPS or checkpoint location")
    distance_remaining: float = Field(..., description="Remaining distance in km")
    expected_delivery_time: str = Field(..., description="Current ETA / scheduled delivery time")
    traffic: str = Field(..., description="Current traffic condition (e.g. Light, Moderate, Heavy)")
    weather: str = Field(..., description="Current weather condition (e.g. Clear, Rain, Storm, Fog)")
    vehicle_health: str = Field(..., description="Vehicle health status (e.g. Healthy, Warning, Faulty)")
    driver_status: str = Field(..., description="Driver status (e.g. Available, Rest Required, Delayed)")
    historical_delay_info: Optional[str] = Field(None, description="Optional historical delay statistics")


class ShipmentUpdate(BaseModel):
    """Data model for dynamic shipment state updates during simulation."""
    traffic: Optional[str] = None
    weather: Optional[str] = None
    vehicle_health: Optional[str] = None
    driver_status: Optional[str] = None
    distance_remaining: Optional[float] = None
    expected_delivery_time: Optional[str] = None
