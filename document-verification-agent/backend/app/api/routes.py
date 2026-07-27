# API Routes for Document Verification
import os
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.ocr_service import extract_text
from app.services.parser_service import parse_driving_license_text

logger = logging.getLogger(__name__)

# Create an APIRouter instance to group related endpoints
router = APIRouter()

@router.get("/")
async def root():
    """
    Root endpoint.
    Returns a welcome message indicating the backend is running.
    """
    return {"message": "Document Verification Backend Running"}

@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    Used by load balancers or monitoring tools to verify the service is up.
    """
    return {"status": "OK"}

# Constants for file upload
UPLOAD_DIR = "app/uploads"
ALLOWED_CONTENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(None)):
    """
    Uploads a PDF or Image document, runs EasyOCR (with page conversion for PDF),
    passes text to parser_service for regex rule-based extraction, and returns structured JSON response.
    """
    # 1. Check if file is missing
    if not file:
        raise HTTPException(status_code=400, detail="File is missing")

    # 2. Validate file type (PDF, PNG, JPG, JPEG)
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed."
        )

    # 3. Read file content to validate size
    file_content = await file.read()
    file_size = len(file_content)

    # 4. Check file size limit
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, 
            detail="File size exceeds the maximum limit of 10 MB."
        )

    # 5. Ensure the uploads directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 6. Save the file to disk
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    # 7. Step 1: Run EasyOCR (handles PDF page splitting automatically)
    ocr_result = extract_text(file_path)
    
    if not ocr_result.get("success"):
        error_msg = ocr_result.get("message", "OCR Failed")
        return {
            "success": False,
            "issuingAuthority": "Not Found",
            "documentType": "Not Found",
            "fullName": "Not Found",
            "dateOfBirth": "Not Found",
            "issueDate": "Not Found",
            "expiryDate": "Not Found",
            "documentNumber": "Not Found",
            "ocrText": error_msg,
            "message": error_msg
        }

    raw_ocr_text = ocr_result.get("text", "")

    # 8. Step 2: Pass OCR text into Regex Parser
    parsed_fields = parse_driving_license_text(raw_ocr_text)

    # 9. Return structured JSON matching required schema
    return {
        "success": True,
        "issuingAuthority": parsed_fields.get("issuingAuthority", "Not Found"),
        "documentType": parsed_fields.get("documentType", "Not Found"),
        "fullName": parsed_fields.get("fullName", "Not Found"),
        "dateOfBirth": parsed_fields.get("dateOfBirth", "Not Found"),
        "issueDate": parsed_fields.get("issueDate", "Not Found"),
        "expiryDate": parsed_fields.get("expiryDate", "Not Found"),
        "documentNumber": parsed_fields.get("documentNumber", "Not Found"),
        "ocrText": raw_ocr_text if raw_ocr_text else "Not Found",
        "message": "OCR Extraction Successful"
    }
