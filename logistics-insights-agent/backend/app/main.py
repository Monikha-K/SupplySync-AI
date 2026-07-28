from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routes import insights

app = FastAPI(title="SupplySync AI - Logistics Insights Agent API")

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


app.include_router(insights.router, prefix="/api/insights", tags=["insights"])


@app.get("/")
async def root():
    return {"message": "Logistics Insights Agent Backend is running."}
