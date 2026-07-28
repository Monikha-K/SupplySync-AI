from fastapi import APIRouter
from models.route_request import RouteRequest

from services.geocode_service import get_coordinates
from services.route_service import get_route
from services.scoring_service import score_route
from services.groq_service import explain_route

router = APIRouter()


@router.post("/recommend-route")
def recommend_route(request: RouteRequest):

    pickup = get_coordinates(request.pickup_city)
    delivery = get_coordinates(request.delivery_city)

    route = get_route(
        pickup,
        delivery
    )

    scored_route = score_route(
        route,
        request.priority
    )

    reason = explain_route(
        scored_route,
        request.priority
    )

    return {
        "pickup": pickup,
        "delivery": delivery,
        "recommended_route": scored_route,
        "reason": reason
    }