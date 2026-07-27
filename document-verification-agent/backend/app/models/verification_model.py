from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class OCRInfo(BaseModel):
    engine: str = "EasyOCR"
    status: str = Field(..., description="Status of OCR extraction")
    processingTime: float = Field(0.0, description="Time taken in seconds")
    rawText: str = Field(..., description="Raw text extracted by OCR")

class AnalysisCheck(BaseModel):
    score: int
    status: str
    remarks: str

class AIAnalysis(BaseModel):
    mandatoryFields: Optional[AnalysisCheck] = None
    documentValidity: Optional[AnalysisCheck] = None
    fieldCompleteness: Optional[AnalysisCheck] = None
    dateConsistency: Optional[AnalysisCheck] = None
    formatValidation: Optional[AnalysisCheck] = None
    ocrCompleteness: Optional[AnalysisCheck] = None

class AIVerification(BaseModel):
    status: str = Field(..., description="AI verification status (e.g. Verified, Needs Review, Rejected)")
    overallTrustScore: int = Field(0, description="Calculated trust score (0-100)")
    riskLevel: str = Field(..., description="Calculated risk level")
    documentQuality: str = Field(..., description="Assessed document quality")
    verificationSummary: str = Field(..., description="Summary paragraph from AI")
    analysis: AIAnalysis
    recommendations: List[str] = Field(default_factory=list)

class VerificationReportModel(BaseModel):
    """
    Schema representing a complete verification report entry in MongoDB.
    """
    verificationId: str = Field(..., description="Unique ID for this verification attempt")
    documentId: str = Field(..., description="ID of the uploaded document/image")
    documentType: str = Field(..., description="driving_license or rc_book")
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)
    ocr: OCRInfo
    extractedFields: Dict[str, Any] = Field(..., description="Structured fields from the parser")
    aiVerification: AIVerification
    finalDecision: Optional[str] = Field(None, description="Final status after manual review if needed")
