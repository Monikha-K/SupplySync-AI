import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.config import settings

class MongoDB:
    client: AsyncIOMotorClient | None = None
    db = None

mongodb = MongoDB()


async def connect_to_mongo():
    try:
        mongodb.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=60000,
            retryWrites=True,
            tlsCAFile=certifi.where()
        )

        # Verify connection
        await mongodb.client.admin.command("ping")

        mongodb.db = mongodb.client[settings.DATABASE_NAME]

        print("MongoDB Connected Successfully")

    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        # Do not raise the error, allowing the app to start
        # The endpoints will handle DB unavailability


async def close_mongo_connection():
    if mongodb.client is not None:
        mongodb.client.close()
        print("MongoDB Connection Closed")