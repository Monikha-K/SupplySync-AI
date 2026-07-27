import os
import sys
import uuid
import random
from datetime import datetime, timedelta
from faker import Faker

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.mongodb import db_client
from app.models.license_model import SyntheticLicenseModel, DriverInfo, LicenceDetails, LicenceFiles, DatasetInfo
from app.models.rcbook_model import SyntheticRCBookModel, VehicleInfo, RCBookFiles
from app.services.database_service import DatabaseService

fake = Faker('en_IN')

# Ensure uploads directories exist for generated files
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

def generate_driving_licenses(count: int = 1000):
    print(f"Generating {count} Synthetic Driving Licences...")
    blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    vehicle_classes = ["MCWG", "LMV", "TRANS", "MCWOG", "MCWG-NT"]
    
    generated_count = 0
    inserted_count = 0
    
    while generated_count < count:
        doc_id = str(uuid.uuid4())
        dl_number = f"TN{random.randint(10, 99)} {random.randint(10000000000, 99999999999)}"
        
        # Fake Image generation (we'll just create a dummy file to represent the image)
        front_img_name = f"{doc_id}_front.jpg"
        back_img_name = f"{doc_id}_back.jpg"
        
        with open(os.path.join(UPLOADS_DIR, front_img_name), "w") as f:
            f.write("Fake DL Image Front Data")
            
        with open(os.path.join(UPLOADS_DIR, back_img_name), "w") as f:
            f.write("Fake DL Image Back Data")

        issue_date_obj = fake.date_between(start_date='-10y', end_date='today')
        expiry_date_obj = issue_date_obj + timedelta(days=365 * 20)

        license_data = SyntheticLicenseModel(
            documentId=doc_id,
            documentType="driving_license",
            driver=DriverInfo(
                name=fake.name().upper(),
                dateOfBirth=fake.date_of_birth(minimum_age=18, maximum_age=65).strftime("%d-%m-%Y"),
                bloodGroup=random.choice(blood_groups),
                address=fake.address().replace("\n", ", ")
            ),
            licence=LicenceDetails(
                number=dl_number,
                vehicleClass=random.choice(vehicle_classes),
                issueDate=issue_date_obj.strftime("%d-%m-%Y"),
                expiryDate=expiry_date_obj.strftime("%d-%m-%Y")
            ),
            files=LicenceFiles(
                frontImage=front_img_name,
                backImage=back_img_name
            ),
            dataset={
                "generated": True,
                "generator": "Python Synthetic Generator v2",
                "version": "2.0",
                "createdAt": datetime.utcnow()
            }
        )
        
        generated_count += 1
        
        # Check whether documentId already exists
        try:
            if db_client.db is not None and db_client.synthetic_licenses.find_one({"documentId": doc_id}):
                print(f"Skipped duplicate:\n{doc_id}")
                continue
        except Exception as e:
            print(f"Error checking duplicate: {e}")
            continue
            
        # Insert to DB
        try:
            inserted_id = DatabaseService.insert_synthetic_license(license_data)
            if inserted_id:
                inserted_count += 1
                print(f"Inserted License:\n{doc_id}")
        except Exception as e:
            print(f"Exception during insert: {e}")
            import traceback
            traceback.print_exc()
            continue
                
    return generated_count, inserted_count

def generate_rc_books(count: int = 1000):
    print(f"Generating {count} Synthetic RC Books...")
    makers = ["MARUTI SUZUKI", "HYUNDAI", "TATA MOTORS", "MAHINDRA", "HONDA", "TOYOTA"]
    models = ["SWIFT", "i20", "NEXON", "THAR", "CITY", "INNOVA"]
    vehicle_classes = ["LMV", "M-Cycle/Scooter", "Transport Vehicle"]
    
    generated_count = 0
    inserted_count = 0
    
    while generated_count < count:
        doc_id = str(uuid.uuid4())
        reg_number = f"TN{random.randint(10, 99)}{random.choice(['A','B','C','AA','AB','XX'])}{random.randint(1000, 9999)}"
        chassis_number = fake.bothify(text='?#??##????#######', letters='ABCDEFGHJKLMNPRSTUVWXYZ')
        engine_number = fake.bothify(text='?#??##????#######', letters='ABCDEFGHJKLMNPRSTUVWXYZ')
        
        # Fake PDF generation (dummy file)
        pdf_name = f"{doc_id}_rcbook.pdf"
        with open(os.path.join(UPLOADS_DIR, pdf_name), "w") as f:
            f.write("Fake RC Book PDF Data")

        rcbook_data = SyntheticRCBookModel(
            documentId=doc_id,
            documentType="rc_book",
            vehicle=VehicleInfo(
                registrationNumber=reg_number,
                chassisNumber=chassis_number,
                engineNumber=engine_number,
                makersName=random.choice(makers),
                modelName=random.choice(models),
                vehicleClass=random.choice(vehicle_classes)
            ),
            files=RCBookFiles(
                pdf=pdf_name
            ),
            dataset={
                "generated": True,
                "generator": "Python Synthetic Generator v2",
                "version": "2.0",
                "createdAt": datetime.utcnow()
            }
        )

        generated_count += 1
        
        # Check whether documentId already exists
        try:
            if db_client.db is not None and db_client.synthetic_rcbooks.find_one({"documentId": doc_id}):
                print(f"Skipped duplicate:\n{doc_id}")
                continue
        except Exception as e:
            print(f"Error checking duplicate: {e}")
            continue

        try:
            inserted_id = DatabaseService.insert_synthetic_rcbook(rcbook_data)
            if inserted_id:
                inserted_count += 1
                print(f"Inserted RC Book:\n{doc_id}")
        except Exception as e:
            print(f"Exception during insert: {e}")
            import traceback
            traceback.print_exc()
            continue
                
    return generated_count, inserted_count

if __name__ == "__main__":
    if db_client.db is not None:
        print("[SUCCESS] Connected to MongoDB")
    else:
        print("[FAIL] Failed to connect to MongoDB")
        sys.exit(1)
        
    print("Starting Synthetic Dataset Generation & MongoDB Integration...")
    # Generate 1000 of each
    gen_dl, ins_dl = generate_driving_licenses(1000)
    gen_rc, ins_rc = generate_rc_books(1000)
    
    print(f"\nGenerated:\n{gen_dl} Licenses")
    print(f"Generated:\n{gen_rc} RC Books")
    print(f"Inserted:\n{ins_dl} MongoDB License Records")
    print(f"Inserted:\n{ins_rc} MongoDB RC Records")
    print("Done! All records processed.")
