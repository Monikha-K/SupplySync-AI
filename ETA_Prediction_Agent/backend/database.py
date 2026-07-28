from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))

db = client[os.getenv("DATABASE_NAME")]

shipments = db[os.getenv("COLLECTION_NAME")]


def get_shipment_by_id(shipment_id):
    return shipments.find_one({"shipmentId": shipment_id}, {"_id": 0})