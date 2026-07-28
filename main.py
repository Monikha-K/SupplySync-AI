import os
import json
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("supplysync.main")

from services.db_service import db_service
from api.routes import router as api_router

# Initialize FastAPI application
app = FastAPI(
    title="SupplySync AI - Autonomous Risk Prediction Agent",
    description="Production-grade AI Agent platform predicting logistics shipment risks and triggering customer communications.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API routes
app.include_router(api_router)

# Mount Static Files for Dashboard UI
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.on_event("startup")
def on_startup():
    """Startup routine: Load initial sample shipments into SQLite database."""
    logger.info("SupplySync AI Agent Platform Starting Up...")
    try:
        data_file = BASE_DIR / "data" / "shipment.json"
        if data_file.exists():
            with open(data_file, "r", encoding="utf-8") as f:
                shipments = json.load(f)
                for s in shipments:
                    db_service.upsert_shipment(s)
            logger.info(f"Loaded {len(shipments)} initial shipments into SQLite database.")
    except Exception as e:
        logger.error(f"Error loading initial shipment data: {e}", exc_info=True)


@app.get("/")
def read_root():
    """Serve the SupplySync AI Interactive Dashboard UI."""
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "SupplySync AI Agent API Running. Access /docs for REST API documentation."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)