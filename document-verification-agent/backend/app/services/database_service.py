import logging
from typing import List, Optional
from app.config.mongodb import db_client
from app.models.license_model import SyntheticLicenseModel
from app.models.rcbook_model import SyntheticRCBookModel
from app.models.verification_model import VerificationReportModel

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service to handle all MongoDB Database CRUD Operations."""
    
    @staticmethod
    def insert_synthetic_license(license_data: SyntheticLicenseModel) -> Optional[str]:
        """Inserts a generated synthetic Driving Licence into the database."""
        if db_client.db is None:
            logger.error("Database connection is not initialized.")
            return None
        
        try:
            # We dump the pydantic model to a dict, converting datetime to string/BSON types
            document = license_data.model_dump()
            result = db_client.synthetic_licenses.insert_one(document)
            logger.info(f"Inserted synthetic license with documentId: {license_data.documentId}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error inserting synthetic license: {e}")
            return None

    @staticmethod
    def insert_synthetic_rcbook(rcbook_data: SyntheticRCBookModel) -> Optional[str]:
        """Inserts a generated synthetic RC Book into the database."""
        if db_client.db is None:
            logger.error("Database connection is not initialized.")
            return None
            
        try:
            document = rcbook_data.model_dump()
            result = db_client.synthetic_rcbooks.insert_one(document)
            logger.info(f"Inserted synthetic RC book with documentId: {rcbook_data.documentId}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error inserting synthetic RC book: {e}")
            return None

    @staticmethod
    def insert_verification_report(report_data: VerificationReportModel) -> Optional[str]:
        """Stores a new Document Verification Report from the live system."""
        if db_client.db is None:
            logger.error("Database connection is not initialized.")
            return None
            
        try:
            document = report_data.model_dump()
            result = db_client.verification_reports.insert_one(document)
            logger.info(f"Inserted verification report with ID: {report_data.verificationId}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error inserting verification report: {e}")
            return None

    @staticmethod
    def get_all_licenses() -> List[dict]:
        """Fetches all synthetic licences."""
        if db_client.db is None:
            return []
        try:
            # Exclude MongoDB internal _id object from results for pure JSON response
            return list(db_client.synthetic_licenses.find({}, {"_id": 0}))
        except Exception as e:
            logger.error(f"Error fetching licenses: {e}")
            return []

    @staticmethod
    def get_all_rcbooks() -> List[dict]:
        """Fetches all synthetic RC Books."""
        if db_client.db is None:
            return []
        try:
            return list(db_client.synthetic_rcbooks.find({}, {"_id": 0}))
        except Exception as e:
            logger.error(f"Error fetching RC books: {e}")
            return []

    @staticmethod
    def get_all_verifications() -> List[dict]:
        """Fetches all verification reports."""
        if db_client.db is None:
            return []
        try:
            return list(db_client.verification_reports.find({}, {"_id": 0}).sort("uploadedAt", -1))
        except Exception as e:
            logger.error(f"Error fetching verification reports: {e}")
            return []

    @staticmethod
    def get_verification_by_id(verification_id: str) -> Optional[dict]:
        """Fetches a specific verification report by verificationId."""
        if db_client.db is None:
            return None
        try:
            return db_client.verification_reports.find_one({"verificationId": verification_id}, {"_id": 0})
        except Exception as e:
            logger.error(f"Error fetching verification {verification_id}: {e}")
            return None

    @staticmethod
    def get_dashboard_statistics() -> dict:
        """Aggregates data across collections for the analytics dashboard."""
        if db_client.db is None:
            return {
                "totalLicences": 0,
                "totalRCBooks": 0,
                "totalVerifications": 0,
                "approved": 0,
                "manualReview": 0,
                "rejected": 0,
                "averageTrustScore": 0,
                "averageOCRTime": 0
            }
            
        try:
            total_licenses = db_client.synthetic_licenses.count_documents({})
            total_rcbooks = db_client.synthetic_rcbooks.count_documents({})
            total_verifications = db_client.verification_reports.count_documents({})
            
            approved = db_client.verification_reports.count_documents({"aiVerification.status": "Verified"})
            manual_review = db_client.verification_reports.count_documents({"aiVerification.status": "Needs Review"})
            rejected = db_client.verification_reports.count_documents({"aiVerification.status": "Rejected"})
            
            # Aggregate average trust score
            trust_score_agg = list(db_client.verification_reports.aggregate([
                {"$group": {"_id": None, "avgScore": {"$avg": "$aiVerification.overallTrustScore"}}}
            ]))
            avg_trust = round(trust_score_agg[0]["avgScore"], 1) if trust_score_agg and trust_score_agg[0]["avgScore"] is not None else 0
            
            # Aggregate average OCR time
            ocr_time_agg = list(db_client.verification_reports.aggregate([
                {"$group": {"_id": None, "avgTime": {"$avg": "$ocr.processingTime"}}}
            ]))
            avg_ocr_time = round(ocr_time_agg[0]["avgTime"], 2) if ocr_time_agg and ocr_time_agg[0]["avgTime"] is not None else 0
            
            return {
                "totalLicences": total_licenses,
                "totalRCBooks": total_rcbooks,
                "totalVerifications": total_verifications,
                "approved": approved,
                "manualReview": manual_review,
                "rejected": rejected,
                "averageTrustScore": avg_trust,
                "averageOCRTime": avg_ocr_time
            }
        except Exception as e:
            logger.error(f"Error computing dashboard statistics: {e}")
            return {
                "totalLicences": 0,
                "totalRCBooks": 0,
                "totalVerifications": 0,
                "approved": 0,
                "manualReview": 0,
                "rejected": 0,
                "averageTrustScore": 0,
                "averageOCRTime": 0
            }
