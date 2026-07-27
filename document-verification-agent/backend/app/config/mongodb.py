import os
import logging
import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "SupplySyncAI")

class MongoDBClient:
    """Singleton MongoDB Client to handle connection pooling."""
    _instance = None
    client: MongoClient = None
    db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
            cls._instance._connect()
        return cls._instance

    def _connect(self):
        """Initializes the MongoClient with connection pooling parameters."""
        try:
            # We configure a robust connection pool for performance.
            # Adding certifi for root certificates (required on Windows for Atlas)
            self.client = MongoClient(
                MONGODB_URI,
                tlsCAFile=certifi.where(),
                maxPoolSize=50,
                minPoolSize=10,
                maxIdleTimeMS=50000,
                serverSelectionTimeoutMS=5000
            )
            # Verify connection
            self.client.admin.command('ping')
            self.db = self.client[DATABASE_NAME]
            logger.info(f"Successfully connected to MongoDB Atlas. Database: {DATABASE_NAME}")
            
            # Setup Collections
            self.synthetic_licenses = self.db["synthetic_licenses"]
            self.synthetic_rcbooks = self.db["synthetic_rcbooks"]
            self.verification_reports = self.db["verification_reports"]
            
            self._create_indexes()
            
        except ServerSelectionTimeoutError as e:
            if "SSL handshake failed" in str(e) or "TLSV1_ALERT_INTERNAL_ERROR" in str(e):
                logger.error("❌ MONGODB CONNECTION FAILED: TLS/SSL Handshake Error.")
                logger.error("👉 ROOT CAUSE: Your current IP address is NOT whitelisted in MongoDB Atlas.")
                logger.error("👉 FIX: Go to MongoDB Atlas -> Network Access -> Add IP Address -> 'Add Current IP Address'")
            else:
                logger.error(f"Failed to connect to MongoDB Atlas: {e}")
            self.client = None
            self.db = None
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}")
            self.client = None
            self.db = None
            
    def _create_indexes(self):
        """Creates mandatory unique indexes for the collections to prevent duplicates and speed up queries."""
        try:
            # unique index on documentId for synthetic_licenses
            self.synthetic_licenses.create_index("documentId", unique=True)
            self.synthetic_licenses.create_index("licence.number", unique=True)
            
            # unique index on documentId and registrationNumber for synthetic_rcbooks
            self.synthetic_rcbooks.create_index("documentId", unique=True)
            self.synthetic_rcbooks.create_index("vehicle.registrationNumber", unique=True)
            
            # unique index on verificationId and documentId for verification_reports
            self.verification_reports.create_index("verificationId", unique=True)
            self.verification_reports.create_index("documentId")
            
            logger.info("MongoDB indexes verified/created successfully.")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")

# Global instance
db_client = MongoDBClient()

def get_db():
    """Helper function to get the initialized MongoDB database instance."""
    return db_client.db

def get_collection(collection_name: str):
    """Helper function to get a specific collection."""
    if db_client.db is not None:
        return db_client.db[collection_name]
    return None
