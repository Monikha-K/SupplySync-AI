# Main entry point for the FastAPI application
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.dataset import router as dataset_router
from app.api.dashboard import router as dashboard_router

# Initialize the FastAPI app
app = FastAPI(
    title="Document Verification Agent API",
    description="Backend for the AI Document Verification logistics project"
)

# Configure Cross-Origin Resource Sharing (CORS)
# This allows the React frontend running on localhost:5173 to communicate with this backend
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # Origins that are allowed to make requests
    allow_credentials=True,    # Allow cookies/credentials
    allow_methods=["*"],       # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],       # Allow all headers
)

# Register the routes from the api/routes.py file
# This mounts our endpoints (like GET / and GET /health) into the main application
app.include_router(router)
app.include_router(dataset_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

