import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.database.mongodb import get_database
from app.config.config import settings
from app.schemas.simulation import StartSimulationRequest, SimulationEvent, CompleteSimulationRequest
from app.utils.route_generator import get_district_coords, generate_route_waypoints

router = APIRouter()

EVENT_LABEL_MAP = {
    "TRAFFIC": "Heavy Traffic",
    "HEAVY_RAIN": "Heavy Rain",
    "ROAD_BLOCK": "Road Block",
    "VEHICLE_BREAKDOWN": "Vehicle Breakdown"
}

@router.get("/accepted-shipments")
async def get_accepted_shipments():
    db = get_database()
    shipments_col = db[settings.SHIPMENTS_COLLECTION]
    cursor = shipments_col.find({
        "readyForSimulation": True,
        "simulationStatus": "Not Started"
    })
    shipments = await cursor.to_list(length=100)
    
    # Clean up _id for JSON serialization
    for s in shipments:
        s.pop("_id", None)
    return shipments

@router.get("/accepted-shipments/{shipmentId}")
async def get_accepted_shipment(shipmentId: str):
    db = get_database()
    shipments_col = db[settings.SHIPMENTS_COLLECTION]
    shipment = await shipments_col.find_one({"shipmentId": shipmentId})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    shipment.pop("_id", None)
    return shipment

@router.get("/completed")
async def get_completed_simulations():
    db = get_database()
    sims_col = db[settings.SIMULATIONS_COLLECTION]
    cursor = sims_col.find({"status": "Completed"}).sort("completedAt", -1)
    sims = await cursor.to_list(length=100)
    for s in sims:
        s.pop("_id", None)
    return sims

@router.get("/completed/{shipmentId}")
async def get_completed_simulation_by_shipment(shipmentId: str):
    db = get_database()
    sims_col = db[settings.SIMULATIONS_COLLECTION]
    sim = await sims_col.find_one({"shipmentId": shipmentId, "status": "Completed"}, sort=[("completedAt", -1)])
    if not sim:
        raise HTTPException(status_code=404, detail="Completed simulation not found for this shipment")
    sim.pop("_id", None)
    return sim

@router.post("/start")
async def start_simulation(req: StartSimulationRequest):
    db = get_database()
    shipments_col = db[settings.SHIPMENTS_COLLECTION]
    simulations_col = db[settings.SIMULATIONS_COLLECTION]

    shipment = await shipments_col.find_one({"shipmentId": req.shipmentId})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    sim_id = f"SIM{uuid.uuid4().hex[:6].upper()}"
    src_coords = get_district_coords(shipment.get("source"))
    dest_coords = get_district_coords(shipment.get("destination"))
    waypoints = generate_route_waypoints(src_coords, dest_coords)

    sim_doc = {
        "simulationId": sim_id,
        "shipmentId": shipment["shipmentId"],
        "organizationName": shipment.get("organizationName", "Unknown"),
        "source": shipment.get("source"),
        "destination": shipment.get("destination"),
        "distanceKm": shipment.get("distanceKm", 0),
        "averageETAHours": shipment.get("averageETAHours", 0),
        "plannedETA": shipment.get("averageETAHours", 0),
        "vehicleType": shipment.get("vehicleType", "Unknown"),
        "shipmentWeight": shipment.get("shipmentWeight", "Unknown"),
        "progress": 0,
        "remainingDistance": shipment.get("distanceKm", 0),
        "remainingETA": shipment.get("averageETAHours", 0),
        "status": "Not Started",
        "simulationSpeed": 1.0,
        "simulationSpeedStr": req.simulationSpeedStr,
        "simulationMode": req.simulationMode,
        "checkpointInterval": req.checkpointInterval,
        "animationSpeed": req.animationSpeed,
        "currentCheckpoint": 0,
        "currentLocation": {"lat": src_coords[0], "lng": src_coords[1]},
        "routeCoordinates": waypoints,
        "activeEvent": None,
        "simulationEvents": [],
        "startedAt": datetime.utcnow(),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "lastUpdated": datetime.utcnow()
    }

    await simulations_col.insert_one(sim_doc.copy())
    
    sim_doc.pop("_id", None)
    return sim_doc

@router.get("/{simulationId}")
async def get_simulation(simulationId: str):
    db = get_database()
    sim_doc = await db[settings.SIMULATIONS_COLLECTION].find_one({"simulationId": simulationId})
    if not sim_doc:
        raise HTTPException(status_code=404, detail="Simulation not found")
    sim_doc.pop("_id", None)
    return sim_doc

@router.post("/{simulationId}/start")
async def update_sim_start(simulationId: str):
    db = get_database()
    result = await db[settings.SIMULATIONS_COLLECTION].update_one(
        {"simulationId": simulationId},
        {"$set": {"status": "Accepted", "updatedAt": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"message": "Simulation started"}

@router.post("/{simulationId}/pause")
async def update_sim_pause(simulationId: str):
    # Purely a signal endpoint, status could be managed by frontend
    db = get_database()
    await db[settings.SIMULATIONS_COLLECTION].update_one(
        {"simulationId": simulationId},
        {"$set": {"updatedAt": datetime.utcnow()}}
    )
    return {"message": "Simulation paused"}

@router.post("/{simulationId}/resume")
async def update_sim_resume(simulationId: str):
    db = get_database()
    await db[settings.SIMULATIONS_COLLECTION].update_one(
        {"simulationId": simulationId},
        {"$set": {"updatedAt": datetime.utcnow()}}
    )
    return {"message": "Simulation resumed"}

@router.post("/{simulationId}/reset")
async def update_sim_reset(simulationId: str):
    db = get_database()
    sim_doc = await db[settings.SIMULATIONS_COLLECTION].find_one({"simulationId": simulationId})
    if not sim_doc:
        raise HTTPException(status_code=404, detail="Simulation not found")

    await db[settings.SIMULATIONS_COLLECTION].update_one(
        {"simulationId": simulationId},
        {"$set": {
            "progress": 0,
            "remainingDistance": sim_doc.get("distanceKm", 0),
            "remainingETA": sim_doc.get("averageETAHours", 0),
            "status": "Not Started",
            "activeEvent": None,
            "currentLocation": {"lat": sim_doc["routeCoordinates"][0][0], "lng": sim_doc["routeCoordinates"][0][1]},
            "updatedAt": datetime.utcnow()
        }}
    )
    return {"message": "Simulation reset"}

@router.post("/{simulationId}/event")
async def update_sim_event(simulationId: str, req: SimulationEvent):
    db = get_database()
    event_label = EVENT_LABEL_MAP.get(req.event, req.event)
    result = await db[settings.SIMULATIONS_COLLECTION].update_one(
        {"simulationId": simulationId},
        {
            "$set": {"activeEvent": req.event, "updatedAt": datetime.utcnow(), "lastUpdated": datetime.utcnow()},
            "$addToSet": {"simulationEvents": event_label}
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"message": "Event applied"}

@router.post("/{simulationId}/complete")
async def complete_simulation(simulationId: str, req: CompleteSimulationRequest = None):
    db = get_database()
    sim_doc = await db[settings.SIMULATIONS_COLLECTION].find_one({"simulationId": simulationId})
    if not sim_doc:
        raise HTTPException(status_code=404, detail="Simulation not found")

    planned_eta = float(sim_doc.get("plannedETA") or sim_doc.get("averageETAHours") or 0.0)

    existing_events = sim_doc.get("simulationEvents", [])
    req_events = req.simulationEvents if (req and req.simulationEvents) else []
    merged_events = list(dict.fromkeys(existing_events + req_events))

    if req and req.actualTravelTime is not None:
        actual_travel_time = round(float(req.actualTravelTime), 2)
    else:
        extra_delay_hours = 0.0
        for ev in merged_events:
            if ev in ["Heavy Traffic", "TRAFFIC", "Traffic"]:
                extra_delay_hours += 0.25
            elif ev in ["Heavy Rain", "HEAVY_RAIN"]:
                extra_delay_hours += 0.40
            elif ev in ["Road Block", "ROAD_BLOCK"]:
                extra_delay_hours += 0.75
            elif ev in ["Vehicle Breakdown", "VEHICLE_BREAKDOWN"]:
                extra_delay_hours += 1.25
            else:
                extra_delay_hours += 0.20
        actual_travel_time = round(planned_eta + extra_delay_hours, 2)

    delay_minutes = round(max(0.0, (actual_travel_time - planned_eta) * 60.0), 2)

    if delay_minutes <= 10:
        performance_score = 100
    elif delay_minutes <= 20:
        performance_score = 95
    elif delay_minutes <= 30:
        performance_score = 90
    elif delay_minutes <= 60:
        performance_score = 85
    else:
        performance_score = 80

    now = datetime.utcnow()
    started_at = sim_doc.get("startedAt") or sim_doc.get("createdAt") or now
    current_checkpoint = len(sim_doc.get("routeCoordinates", []))

    update_fields = {
        "simulationId": sim_doc.get("simulationId", simulationId),
        "shipmentId": sim_doc.get("shipmentId", ""),
        "organizationName": sim_doc.get("organizationName", "Unknown"),
        "source": sim_doc.get("source", ""),
        "destination": sim_doc.get("destination", ""),
        "vehicleType": sim_doc.get("vehicleType", "Unknown"),
        "shipmentWeight": sim_doc.get("shipmentWeight", "Unknown"),
        "distanceKm": float(sim_doc.get("distanceKm", 0.0)),
        "plannedETA": planned_eta,
        "actualTravelTime": actual_travel_time,
        "delayMinutes": delay_minutes,
        "simulationSpeed": req.simulationSpeed if (req and req.simulationSpeed is not None) else sim_doc.get("simulationSpeed", 1.0),
        "currentCheckpoint": current_checkpoint,
        "progress": 100,
        "status": "Completed",
        "simulationEvents": merged_events,
        "performanceScore": performance_score,
        "startedAt": started_at,
        "completedAt": now,
        "lastUpdated": now,
        "updatedAt": now
    }

    await db[settings.SIMULATIONS_COLLECTION].update_one(
        {"simulationId": simulationId},
        {"$set": update_fields}
    )

    updated_doc = await db[settings.SIMULATIONS_COLLECTION].find_one({"simulationId": simulationId})
    updated_doc.pop("_id", None)
    return updated_doc

