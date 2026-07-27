from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DriverInfo(BaseModel):
    name: str = Field(..., description="Full name of the driver")
    dateOfBirth: str = Field(..., description="Date of birth")
    bloodGroup: Optional[str] = Field(None, description="Blood group")
    address: Optional[str] = Field(None, description="Registered address")

class LicenceDetails(BaseModel):
    number: str = Field(..., description="Driving licence number")
    vehicleClass: str = Field(..., description="Class of vehicle permitted")
    issueDate: str = Field(..., description="Date of issue")
    expiryDate: str = Field(..., description="Date of expiry")

class LicenceFiles(BaseModel):
    frontImage: str = Field(..., description="Path or URL to front image")
    backImage: Optional[str] = Field(None, description="Path or URL to back image")

class DatasetInfo(BaseModel):
    generated: bool = True
    generator: str = "Python Synthetic Generator"
    version: str = "1.0"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class SyntheticLicenseModel(BaseModel):
    """
    Schema representing a synthetic driving licence dataset entry in MongoDB.
    """
    documentId: str = Field(..., description="Unique ID for this document")
    documentType: str = Field(default="driving_license")
    driver: DriverInfo
    licence: LicenceDetails
    files: LicenceFiles
    dataset: DatasetInfo = Field(default_factory=DatasetInfo)
