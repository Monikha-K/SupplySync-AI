import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config.config import settings
from dataset.shipment_generator import generate_shipments


import certifi

async def seed():

    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=60000,
            tlsCAFile=certifi.where()
        )

        # Test Connection
        await client.admin.command("ping")
        print("✅ MongoDB Connected Successfully")

    except Exception as e:
        print(f"❌ Failed to connect to MongoDB:\n{e}")
        return

    db = client[settings.DATABASE_NAME]
    collection = db[settings.COLLECTION_NAME]

    count = await collection.count_documents({})

    if count > 0:
        print(f"⚠ Collection already contains {count} documents.")
        client.close()
        return

    print("Generating shipment dataset...")

    shipments = generate_shipments()

    if not shipments:
        print("❌ Dataset generator returned empty data.")
        client.close()
        return

    await collection.insert_many(shipments)

    print(f"✅ {len(shipments)} Shipments Inserted Successfully")

    await collection.create_index("shipmentId", unique=True)
    await collection.create_index("source")
    await collection.create_index("destination")
    await collection.create_index("status")
    await collection.create_index([("organizationRating", -1)])

    print("✅ Indexes Created")

    client.close()
    print("Database Seed Completed")


if __name__ == "__main__":
    asyncio.run(seed())