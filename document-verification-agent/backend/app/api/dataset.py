import logging
from fastapi import APIRouter
from app.services.database_service import DatabaseService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/dataset/licenses")
async def get_synthetic_licenses():
    """
    Returns all synthetic driving licences stored in MongoDB.
    """
    try:
        licenses = DatabaseService.get_all_licenses()
        return {
            "success": True,
            "count": len(licenses),
            "data": licenses
        }
    except Exception as e:
        logger.error(f"Error in dataset API: {e}")
        return {"success": False, "message": "Failed to fetch dataset"}

@router.get("/dataset/rcbooks")
async def get_synthetic_rcbooks():
    """
    Returns all synthetic RC Books stored in MongoDB.
    """
    try:
        rcbooks = DatabaseService.get_all_rcbooks()
        return {
            "success": True,
            "count": len(rcbooks),
            "data": rcbooks
        }
    except Exception as e:
        logger.error(f"Error in dataset API: {e}")
        return {"success": False, "message": "Failed to fetch dataset"}
