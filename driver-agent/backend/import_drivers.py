import json
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# Read JSON file
with open("drivers_200.json", "r", encoding="utf-8") as file:
    drivers = json.load(file)

# Optional: Clear old data (remove this if you don't want to overwrite)
collection.delete_many({})

# Insert all drivers
result = collection.insert_many(drivers)

print("=" * 50)
print(f"✅ Successfully imported {len(result.inserted_ids)} drivers!")
print(f"📂 Database   : {DATABASE_NAME}")
print(f"📁 Collection : {COLLECTION_NAME}")
print("=" * 50)