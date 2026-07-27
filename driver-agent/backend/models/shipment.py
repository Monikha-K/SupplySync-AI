from pydantic import BaseModel

class Shipment(BaseModel):

    pickup_city: str

    delivery_city: str

    weight_kg: int

    cargo_type: str

    priority: str