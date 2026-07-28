from motor.motor_asyncio import AsyncIOMotorClient
from app.config.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_config = MongoDB()

async def connect_to_mongo():
    try:
        db_config.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tlsAllowInvalidCertificates=True
        )
        db_config.db = db_config.client[settings.DATABASE_NAME]
        print("MongoDB Connected Successfully")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    if db_config.client:
        db_config.client.close()
        print("MongoDB Connection Closed")

def get_database():
    return db_config.db
