from pydantic import BaseModel

class AssignmentRequest(BaseModel):
    driver_id: str
    driver_name: str
    pickup_city: str
    drop_city: str
    cargo_type: str
    weight: int
    priority: str
    recommendation_reason: str
