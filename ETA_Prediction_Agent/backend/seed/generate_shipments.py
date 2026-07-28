from faker import Faker
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random
import os

# ---------------------------------------------------
# Load Environment Variables
# ---------------------------------------------------

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

fake = Faker("en_IN")

# ---------------------------------------------------
# Clear Existing Data (Optional)
# ---------------------------------------------------

collection.delete_many({})

# ---------------------------------------------------
# Number of Shipments
# ---------------------------------------------------

NUMBER_OF_SHIPMENTS = 5000

# ---------------------------------------------------
# Routes
# ---------------------------------------------------

ROUTES = [

    {
        "routeId": "R001",
        "cities": [
            "Chennai",
            "Vellore",
            "Salem",
            "Erode",
            "Coimbatore"
        ],
        "distances": {
            "Chennai": 340,
            "Vellore": 250,
            "Salem": 170,
            "Erode": 90,
            "Coimbatore": 0
        }
    },

    {
        "routeId": "R002",
        "cities": [
            "Chennai",
            "Trichy",
            "Madurai"
        ],
        "distances": {
            "Chennai": 460,
            "Trichy": 140,
            "Madurai": 0
        }
    },

    {
        "routeId": "R003",
        "cities": [
            "Bangalore",
            "Hosur",
            "Salem",
            "Coimbatore"
        ],
        "distances": {
            "Bangalore": 360,
            "Hosur": 300,
            "Salem": 170,
            "Coimbatore": 0
        }
    },

    {
        "routeId": "R004",
        "cities": [
            "Hyderabad",
            "Kurnool",
            "Anantapur",
            "Bangalore"
        ],
        "distances": {
            "Hyderabad": 570,
            "Kurnool": 320,
            "Anantapur": 180,
            "Bangalore": 0
        }
    },

    {
        "routeId": "R005",
        "cities": [
            "Coimbatore",
            "Erode",
            "Salem",
            "Vellore",
            "Chennai"
        ],
        "distances": {
            "Coimbatore": 360,
            "Erode": 280,
            "Salem": 190,
            "Vellore": 120,
            "Chennai": 0
        }
    }

]

# ---------------------------------------------------
# Static Values
# ---------------------------------------------------

traffic_levels = [
    "Low",
    "Moderate",
    "Heavy"
]

weather_conditions = [
    "Sunny",
    "Cloudy",
    "Rain",
    "Fog"
]

vehicle_types = [
    "Truck",
    "Mini Truck",
    "Container",
    "Trailer"
]

priorities = [
    "Low",
    "Medium",
    "High"
]

shipment_status = [
    "Loading",
    "In Transit",
    "Delayed"
]

# ---------------------------------------------------
# Generate Shipments
# ---------------------------------------------------

shipments = []

for i in range(1, NUMBER_OF_SHIPMENTS + 1):

    route = random.choice(ROUTES)

    cities = route["cities"]

    distance_table = route["distances"]

    pickup = cities[0]

    destination = cities[-1]

    current_index = random.randint(0, len(cities) - 2)

    current_location = cities[current_index]

    remaining_distance = distance_table[current_location]

    traffic = random.choice(traffic_levels)

    weather = random.choice(weather_conditions)

    # Speed based on traffic

    if traffic == "Low":
        average_speed = random.randint(65, 75)

    elif traffic == "Moderate":
        average_speed = random.randint(50, 60)

    else:
        average_speed = random.randint(35, 45)

    created_at = fake.date_time_between(
        start_date="-15d",
        end_date="-7d"
    )

    last_updated = created_at + timedelta(
        hours=random.randint(2, 120)
    )

    shipment = {

        "shipmentId": f"SHP{i:06}",

        "routeId": route["routeId"],

        "driverId": f"DRV{random.randint(1,300):03}",

        "driverName": fake.name(),

        "pickup": pickup,

        "destination": destination,

        "currentLocation": current_location,

        "remainingDistance": remaining_distance,

        "averageSpeed": average_speed,

        "traffic": traffic,

        "weather": weather,

        "status": random.choice(shipment_status),

        "priority": random.choice(priorities),

        "vehicleType": random.choice(vehicle_types),

        "cargoWeight": round(
            random.uniform(2, 30),
            2
        ),

        "estimatedDeparture": created_at.strftime("%d-%m-%Y %I:%M %p"),

        "createdAt": created_at,

        "lastUpdated": last_updated

    }

    shipments.append(shipment)

# ---------------------------------------------------
# Insert into MongoDB
# ---------------------------------------------------

collection.insert_many(shipments)

print("=" * 50)
print(f"{NUMBER_OF_SHIPMENTS} Shipments Inserted Successfully")
print("Database :", DATABASE_NAME)
print("Collection :", COLLECTION_NAME)
print("=" * 50)