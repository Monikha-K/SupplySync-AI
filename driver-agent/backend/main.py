from fastapi import FastAPI
from routes.recommendation import router

app = FastAPI(
    title="Driver Recommendation Agent"
)

app.include_router(router)


@app.get("/")
def home():

    return {
        "message": "Driver Recommendation Agent Running"
    }