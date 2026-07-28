from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from models.prediction import EmailContent


class FeasibilityCheckRequest(BaseModel):
    """Payload for checking dynamic product route feasibility and triggering auto-dispatch."""
    source: str = Field(..., description="Origin city or location")
    destination: str = Field(..., description="Destination city or location")
    product_name: str = Field(..., description="Name or title of the product to ship")
    product_category: str = Field("General", description="Category (e.g. Electronics, Medical, Perishable, Heavy Machinery)")
    weight_kg: float = Field(1.0, ge=0.1, description="Total shipment weight in kilograms")
    quantity: int = Field(1, ge=1, description="Quantity of units")
    is_fragile: bool = Field(False, description="Flag indicating fragile or special handling required")
    customer_name: str = Field(..., description="Customer full name")
    customer_email: str = Field(..., description="Customer contact email address")
    notes: Optional[str] = Field(None, description="Additional logistics requirements or notes")


class FeasibilityCheckResponse(BaseModel):
    """Response returned after autonomous route feasibility & product dispatch analysis."""
    feasibility_id: str = Field(..., description="Unique transaction ID for feasibility check")
    is_feasible: bool = Field(..., description="Flag indicating if route is feasible")
    feasibility_status: str = Field(..., description="Summary status label")
    risk_score: int = Field(..., ge=0, le=100, description="Risk Score from 0 to 100")
    risk_level: str = Field(..., description="Risk Level: Low, Medium, High, or Critical")
    estimated_distance_km: float = Field(..., description="Estimated distance in km")
    estimated_transit_hours: float = Field(..., description="Estimated travel time in hours")
    weather_summary: Dict[str, Any] = Field(default_factory=dict, description="Auto-detected weather factors")
    traffic_summary: Dict[str, Any] = Field(default_factory=dict, description="Auto-detected traffic factors")
    product_summary: Dict[str, Any] = Field(default_factory=dict, description="Product specifications evaluated")
    reasons: List[str] = Field(default_factory=list, description="Risk factors and route observations")
    recommended_actions: List[str] = Field(default_factory=list, description="Actionable recommendations")
    action_taken: str = Field(..., description="Autonomous action executed by agent")
    customer_notified: bool = Field(False, description="Flag indicating if customer feasibility email was sent")
    email_content: Optional[EmailContent] = Field(None, description="Dispatched email content preview")
    timestamp: str = Field(..., description="ISO timestamp")
