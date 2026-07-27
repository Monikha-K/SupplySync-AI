import os
import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

def test_mongo_connection():
    print("====================================================")
    print("[DEBUG] MONGODB ATLAS DEBUG SCRIPT")
    print("====================================================")
    
    # 1. Load Env
    print("\n[1/5] Loading Environment Variables...")
    load_dotenv()
    mongo_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DATABASE_NAME")
    
    if not mongo_uri:
        print("[FAIL] Error: MONGODB_URI is None or not set.")
        return
    else:
        print("[SUCCESS] MONGODB_URI loaded successfully (hidden for security).")
        
    if not db_name:
        print("[FAIL] Error: DATABASE_NAME is None or not set.")
        return
    else:
        print(f"[SUCCESS] DATABASE_NAME loaded: {db_name}")

    # 2. Initialize Client
    print("\n[2/5] Initializing MongoClient...")
    try:
        # Using certifi for SSL/TLS resolution
        client = MongoClient(
            mongo_uri,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True, # For debugging TLSV1_ALERT_INTERNAL_ERROR
            serverSelectionTimeoutMS=5000
        )
        print("[SUCCESS] MongoClient created.")
    except Exception as e:
        print(f"[FAIL] Failed to create MongoClient: {e}")
        return

    # 3. Connection Test (Ping)
    print("\n[3/5] Testing Atlas Connection (ping)...")
    try:
        client.admin.command('ping')
        print("[SUCCESS] MongoDB Connected Successfully.")
    except Exception as e:
        print(f"[FAIL] Connection Failed: {e}")
        print("\nException Stack:")
        import traceback
        traceback.print_exc()
        return

    # 4. Database Selection
    print("\n[4/5] Selecting Database and Collections...")
    db = client[db_name]
    print(f"[SUCCESS] Selected Database: {db.name}")
    
    col_licenses = db["synthetic_licenses"]
    print(f"[SUCCESS] Selected Collection: {col_licenses.name}")
    
    # 5. Test Insertion
    print("\n[5/5] Testing Document Insertion...")
    try:
        test_doc = {"documentId": "TEST-12345", "test": "insertion"}
        result = col_licenses.insert_one(test_doc)
        print("[SUCCESS] Insert Success")
        print(f"[SUCCESS] Inserted ID: {result.inserted_id}")
        print(f"[SUCCESS] Database Name: {db.name}")
        print(f"[SUCCESS] Collection Name: {col_licenses.name}")
        print(f"[SUCCESS] Document ID: TEST-12345")
        
        # Cleanup test document
        col_licenses.delete_one({"_id": result.inserted_id})
        
        # Document Count
        count = col_licenses.count_documents({})
        print(f"\n[SUCCESS] Total Documents in '{col_licenses.name}': {count}")
        
    except Exception as e:
        print(f"[FAIL] Insert Failure. Reason: {e}")
        print("\nException Stack:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_mongo_connection()
