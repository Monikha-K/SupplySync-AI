import urllib.request
import json
import sys

base_url = "http://localhost:8004/api/insights"

def test_completed():
    print(f"Testing {base_url}/completed")
    try:
        req = urllib.request.Request(f"{base_url}/completed")
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read())
            print(f"Completed shipments count: {len(data)}")
            if len(data) > 0:
                print("First shipment:", data[0])
    except Exception as e:
        print(f"Error testing /completed: {e}")

def test_report(shipment_id):
    print(f"\nTesting {base_url}/report/{shipment_id}")
    try:
        req = urllib.request.Request(f"{base_url}/report/{shipment_id}")
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read())
            print(f"Report for {shipment_id}:")
            print(f"  Delay Minutes: {data.get('delayMinutes')}")
            print(f"  Performance Score: {data.get('performanceScore')}")
            print(f"  Simulation Events: {data.get('simulationEvents')}")
            print(f"  Recommendations: {data.get('recommendations')}")
    except Exception as e:
        print(f"Error testing /report/{shipment_id}: {e}")

if __name__ == "__main__":
    test_completed()
    # Replace with an actual ID from the DB if known, otherwise we might get a 404
    test_report("SHP000597") 
