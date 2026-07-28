import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.database.mongodb import get_database
from app.config.config import settings
from app.schemas.simulation import StartSimulationRequest, SimulationEvent
from app.utils.route_generator import get_district_coords, generate_route_waypoints

router = APIRouter()

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
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
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
    result = await db[settings.SIMULATIONS_COLLECTION].update_one(
        {"simulationId": simulationId},
        {"$set": {"activeEvent": req.event, "updatedAt": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"message": "Event applied"}
