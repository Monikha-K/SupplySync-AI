from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EmailContent(BaseModel):
    """Generated customer communication email."""
    subject: str
    body: str
    sent_at: Optional[str] = None
    recipient: Optional[str] = None
    status: str = "Pending"  # Sent, Failed, Simulated, Pending


class RiskPrediction(BaseModel):
    """Structured Risk Prediction Result from AI Risk Agent."""
    shipment_id: str = Field(..., description="Shipment identifier")
    risk_score: int = Field(..., ge=0, le=100, description="Risk Score from 0 to 100")
    risk_level: str = Field(..., description="Risk Level: Low, Medium, or High")
    predicted_issue: str = Field("Delivery Delay", description="Primary predicted issue")
    expected_delay: str = Field(..., description="Estimated delay duration, e.g. '45 minutes' or 'No Delay'")
    reason: List[str] = Field(default_factory=list, description="Specific factors contributing to risk")
    recommended_action: List[str] = Field(default_factory=list, description="Actionable recommendations")
    confidence_score: float = Field(0.9, ge=0.0, le=1.0, description="Model confidence score (0.0 - 1.0)")
    action_taken: str = Field("Monitored", description="Autonomous action executed by platform agent")
    customer_notified: bool = Field(False, description="Flag indicating if customer email was dispatched")
    email_content: Optional[EmailContent] = Field(None, description="Detailed customer email if dispatched")
    timestamp: str = Field(..., description="ISO 8601 prediction timestamp")
