# API Routes for Document Verification
from fastapi import APIRouter

# Create an APIRouter instance to group related endpoints
router = APIRouter()

@router.get("/")
async def root():
    """
    Root endpoint.
    Returns a welcome message indicating the backend is running.
    """
    return {"message": "Document Verification Backend Running"}

@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    Used by load balancers or monitoring tools to verify the service is up.
    """
    return {"status": "OK"}
