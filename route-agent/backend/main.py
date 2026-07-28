from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.route import router

app = FastAPI(
    title="Route Optimization Agent"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "message": "Route Agent Running"
    }