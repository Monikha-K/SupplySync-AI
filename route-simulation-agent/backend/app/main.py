from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routes import simulations

app = FastAPI(title="SupplySync AI - Route Simulation Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(simulations.router, prefix="/api/simulations", tags=["simulations"])

@app.get("/")
async def root():
    return {"message": "Route Simulation Agent Backend is running."}
