from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.recommendation import router
from routes.assignment import router as assignment_router

app = FastAPI(
    title="Driver Recommendation Agent"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",   # Add this because Vite is running on 5174
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(assignment_router)

@app.get("/")
def home():
    return {
        "message": "Driver Recommendation Agent Running"
    }