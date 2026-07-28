from pymongo import MongoClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

uri = os.getenv("MONGODB_URI")

print("URI Found:", uri is not None)

try:
    client = MongoClient(
        uri, 
        serverSelectionTimeoutMS=10000,
        tlsCAFile=certifi.where()
    )
    print(client.admin.command("ping"))
    print("✅ MongoDB Connected Successfully")
except Exception as e:
    print("❌ Connection Failed")
    print(e)