from pydantic import BaseModel

class RouteRequest(BaseModel):
    pickup_city: str
    delivery_city: str
    priority: str