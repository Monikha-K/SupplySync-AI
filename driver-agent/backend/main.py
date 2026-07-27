from fastapi import FastAPI
from database import client
from driver_service import get_all_drivers

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Driver Recommendation Agent Running Successfully!"
    }


@app.get("/drivers")
def drivers():
    return get_all_drivers()