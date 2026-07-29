from fastapi import APIRouter

from models.route_request import RouteRequest

from services.geocode_service import get_coordinates
from services.route_service import get_routes
from services.alternative_route_service import generate_alternative_routes
from services.scoring_service import score_routes
from services.groq_service import explain_best_route

router = APIRouter()


@router.post("/recommend-route")
def recommend_route(request: RouteRequest):

    pickup = get_coordinates(request.pickup_city)

    delivery = get_coordinates(request.delivery_city)

    ors_routes = get_routes(pickup, delivery)

    routes = generate_alternative_routes(
        ors_routes,
        request.pickup_city,
        request.delivery_city
    )

    ranked_routes = score_routes(routes, request.priority)

    best_route = ranked_routes[0]

    alternative_routes = ranked_routes[1:]

    reason = explain_best_route(
        best_route,
        alternative_routes,
        request.priority
    )

    return {

        "pickup": pickup,

        "delivery": delivery,

        "recommended_route": best_route,

        "alternative_routes": alternative_routes,

        "reason": reason

    }
