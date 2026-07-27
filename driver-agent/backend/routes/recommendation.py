from fastapi import APIRouter
from models.shipment import Shipment
from services.driver_filter import filter_drivers
from services.groq_service import recommend_best_driver

router = APIRouter()

@router.post("/recommend-driver")
def recommend_driver(shipment: Shipment):

    top_drivers = filter_drivers(shipment)

    if len(top_drivers) == 0:

        return {
            "message":"No suitable drivers found."
        }

    best_driver = recommend_best_driver(
        shipment,
        top_drivers
    )

    return {

        "shipment": shipment,

        "best_driver": best_driver,

        "top_candidates": top_drivers

    }