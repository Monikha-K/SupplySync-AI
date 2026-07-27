import logging
from fastapi import APIRouter
from app.services.database_service import DatabaseService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/dashboard/statistics")
async def get_dashboard_statistics():
    """
    Returns aggregated analytics for the Document Verification dashboard.
    """
    try:
        stats = DatabaseService.get_dashboard_statistics()
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Error in dashboard API: {e}")
        return {"success": False, "message": "Failed to fetch dashboard statistics"}
