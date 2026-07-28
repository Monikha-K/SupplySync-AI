from fastapi import FastAPI, HTTPException
from database import get_shipment_by_id
from eta_service import calculate_eta
from groq_service import generate_eta_summary
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Later replace * with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "ETA Prediction Agent Backend Running"}


@app.get("/shipment/{shipment_id}")
def get_shipment(shipment_id: str):

    shipment = get_shipment_by_id(shipment_id)

    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")

    return shipment

@app.get("/eta/{shipment_id}")
def predict_eta(shipment_id: str):

    shipment = get_shipment_by_id(shipment_id)

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    eta = calculate_eta(
        shipment["remainingDistance"],
        shipment["traffic"],
        shipment["weather"]
    )

    ai_summary = generate_eta_summary(
        shipment,
        eta
    )

    return {
        "shipment": shipment,
        "eta": eta,
        "ai_summary": ai_summary
    }
    


