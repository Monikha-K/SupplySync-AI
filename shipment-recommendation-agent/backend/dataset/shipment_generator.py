import random
from datetime import datetime
from dataset.districts import TAMIL_NADU_DISTRICTS

ORGS = ["ABC Logistics", "Green Freight", "Fast Movers", "South Cargo", "Murugan Transport", "Elite Logistics", "TN Express", "Southern Movers", "Kaveri Transport", "Chennai Express"]

def generate_shipments():
    shipments = []
    shipment_counter = 1
    
    for source in TAMIL_NADU_DISTRICTS:
        for dest in TAMIL_NADU_DISTRICTS:
            if source == dest:
                continue
                
            distance = round(random.uniform(50.0, 600.0), 2)
            eta = round(distance / 40.0, 2)
            weight = round(random.uniform(100.0, 5000.0), 2)
            vehicle = random.choice(["Open Truck", "Closed Container", "Mini Truck", "Trailer"])
            
            num_orgs = random.randint(5, 10)
            selected_orgs = random.sample(ORGS, num_orgs)
            
            for org in selected_orgs:
                shipment_id = f"SHP{shipment_counter:06d}"
                shipment_counter += 1
                
                rating = round(random.uniform(3.5, 5.0), 1)
                
                shipments.append({
                    "shipmentId": shipment_id,
                    "organizationName": org,
                    "organizationRating": rating,
                    "source": source,
                    "destination": dest,
                    "distanceKm": distance,
                    "averageETAHours": eta,
                    "vehicleType": vehicle,
                    "shipmentWeight": weight,
                    "status": "Available",
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                })
    return shipments
