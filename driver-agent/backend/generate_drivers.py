from faker import Faker
import random
import json

fake = Faker("en_IN")
Faker.seed(42)
random.seed(42)

# -------------------------------
# Tamil Nadu Cities with Coordinates
# -------------------------------

cities = {
    "Chennai": (13.0827, 80.2707),
    "Coimbatore": (11.0168, 76.9558),
    "Madurai": (9.9252, 78.1198),
    "Salem": (11.6643, 78.1460),
    "Erode": (11.3410, 77.7172),
    "Tiruppur": (11.1085, 77.3411),
    "Trichy": (10.7905, 78.7047),
    "Hosur": (12.7409, 77.8253),
    "Vellore": (12.9165, 79.1325),
    "Tirunelveli": (8.7139, 77.7567),
    "Thoothukudi": (8.7642, 78.1348),
    "Karur": (10.9601, 78.0766),
    "Namakkal": (11.2194, 78.1674),
    "Dindigul": (10.3673, 77.9803),
    "Kanchipuram": (12.8342, 79.7036)
}

vehicle_types = [
    "Truck",
    "Mini Truck",
    "Container",
    "Trailer",
    "LCV"
]

vehicle_brands = [
    "Ashok Leyland",
    "Tata",
    "BharatBenz",
    "Eicher",
    "Mahindra"
]

cargo_types = [
    "Electronics",
    "Furniture",
    "Food",
    "Textiles",
    "Industrial Goods",
    "FMCG",
    "Pharmaceuticals",
    "Chemicals",
    "Steel",
    "Automobile Parts"
]

languages = [
    "Tamil",
    "English",
    "Hindi",
    "Kannada",
    "Telugu"
]

capacities = [
    1500,
    3000,
    5000,
    8000,
    12000,
    16000,
    20000
]

statuses = [
    "Idle",
    "Waiting",
    "On Trip",
    "Loading"
]

# -------------------------------
# To Maintain Uniqueness
# -------------------------------

phones = set()
licenses = set()
vehicles = set()

drivers = []

# -------------------------------
# Generate Drivers
# -------------------------------

for i in range(1, 1001):

    city = random.choice(list(cities.keys()))
    lat, lon = cities[city]

    # Unique Phone
    while True:
        phone = "9" + "".join(random.choices("0123456789", k=9))
        if phone not in phones:
            phones.add(phone)
            break

    # Unique License
    while True:
        license_number = "TNDL" + str(random.randint(100000, 999999))
        if license_number not in licenses:
            licenses.add(license_number)
            break

    # Unique Vehicle Number
    while True:
        vehicle_number = (
            f"TN{random.randint(10,99)}"
            f"{chr(random.randint(65,90))}"
            f"{chr(random.randint(65,90))}"
            f"{random.randint(1000,9999)}"
        )

        if vehicle_number not in vehicles:
            vehicles.add(vehicle_number)
            break

    experience = random.randint(1, 20)

    completed = random.randint(
        experience * 80,
        experience * 220
    )

    available = random.choice([True, False])

    rating = round(random.uniform(3.8, 5.0), 1)

    driver = {

        "driver_id": f"DR{i:03}",

        "name": fake.name(),

        "age": random.randint(23, 58),

        "gender": random.choice(["Male", "Female"]),

        "phone": phone,

        "email": f"driver{i:03}@supplysync.ai",

        "license_number": license_number,

        "license_expiry": str(
            fake.date_between("+1y", "+8y")
        ),

        "vehicle_number": vehicle_number,

        "vehicle_type": random.choice(vehicle_types),

        "vehicle_brand": random.choice(vehicle_brands),

        "capacity_kg": random.choice(capacities),

        "fuel_type": random.choice(
            ["Diesel", "CNG"]
        ),

        "current_city": city,

        "latitude": round(
            lat + random.uniform(-0.08, 0.08), 6
        ),

        "longitude": round(
            lon + random.uniform(-0.08, 0.08), 6
        ),

        "available": available,

        "status": random.choice(statuses),

        "experience_years": experience,

        "completed_trips": completed,

        "overall_rating": rating,

        "on_time_percentage": random.randint(82, 99),

        "safety_score": random.randint(86, 100),

        "preferred_cargo": random.sample(
            cargo_types,
            k=3
        ),

        "languages": random.sample(
            languages,
            k=2
        ),

        "last_trip_date": str(
            fake.date_between("-30d", "today")
        ),

        "current_load_kg": 0 if available else random.choice(
            [500,1000,2000,3000,5000,7000]
        ),

        "average_response_time_minutes": random.randint(2, 20),

        "driver_status": random.choice(
            ["Active", "Verified"]
        )

    }

    drivers.append(driver)

# -------------------------------
# Save JSON
# -------------------------------

with open("drivers_200.json", "w", encoding="utf-8") as f:

    json.dump(
        drivers,
        f,
        indent=4,
        ensure_ascii=False
    )

print("✅ drivers_200.json generated successfully!")
print(f"Total Drivers: {len(drivers)}")