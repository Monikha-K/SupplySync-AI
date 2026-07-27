from database import drivers_collection

def get_all_drivers():
    drivers = list(drivers_collection.find({}, {"_id": 0}))
    return drivers