from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class VehicleInfo(BaseModel):
    registrationNumber: str = Field(..., description="Vehicle registration number")
    chassisNumber: Optional[str] = Field(None, description="Chassis number (VIN)")
    engineNumber: Optional[str] = Field(None, description="Engine number")
    makersName: Optional[str] = Field(None, description="Manufacturer name")
    modelName: Optional[str] = Field(None, description="Model name")
    vehicleClass: Optional[str] = Field(None, description="Vehicle class")

class RCBookFiles(BaseModel):
    pdf: str = Field(..., description="Path or URL to the generated PDF file")

class DatasetInfo(BaseModel):
    generated: bool = True
    generator: str = "Python Synthetic Generator"
    version: str = "1.0"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class SyntheticRCBookModel(BaseModel):
    """
    Schema representing a synthetic RC Book dataset entry in MongoDB.
    """
    documentId: str = Field(..., description="Unique ID for this document")
    documentType: str = Field(default="rc_book")
    vehicle: VehicleInfo
    files: RCBookFiles
    dataset: DatasetInfo = Field(default_factory=DatasetInfo)
