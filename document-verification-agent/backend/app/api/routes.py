# API Routes for Document Verification
import os
import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.services.ocr_service import extract_text
from app.services.parser_factory import get_parser

logger = logging.getLogger(__name__)

# Create an APIRouter instance to group related endpoints
router = APIRouter()

@router.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Document Verification Backend Running"}

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "OK"}

# Constants for file upload
UPLOAD_DIR = "app/uploads"
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(None),
    documentType: str = Form("driving_license")
):
    """
    Uploads a document (PDF or Image based on documentType), runs EasyOCR,
    passes text to parser_factory selected parser, and returns structured JSON response.
    """
    # 1. Check if file is missing
    if not file:
        raise HTTPException(status_code=400, detail="File is missing")

    filename = file.filename or ""
    is_pdf = file.content_type == "application/pdf" or filename.lower().endswith('.pdf')
    is_image = file.content_type in ["image/png", "image/jpeg", "image/jpg"] or filename.lower().endswith(('.png', '.jpg', '.jpeg'))

    doc_type_clean = (documentType or "driving_license").strip().lower()

    # 2. Format validation based on documentType
    if doc_type_clean == "rc_book":
        if not is_pdf:
            return {
                "success": False,
                "message": "For RC Book only PDF files are supported."
            }
    else: # driving_license
        if not (is_pdf or is_image):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed for Driving Licence."
            )

    # 3. Read file content to validate size
    file_content = await file.read()
    file_size = len(file_content)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, 
            detail="File size exceeds the maximum limit of 10 MB."
        )

    # 4. Ensure the uploads directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 5. Save the file to disk
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    # 6. Step 1: Run EasyOCR
    ocr_result = extract_text(file_path)
    
    if not ocr_result.get("success"):
        error_msg = ocr_result.get("message", "OCR Failed")
        return {
            "success": False,
            "documentType": doc_type_clean,
            "data": {},
            "ocrText": error_msg,
            "message": error_msg
        }

    raw_ocr_text = ocr_result.get("text", "")

    # 7. Step 2: Obtain parser from parser_factory and parse OCR text
    parser_func = get_parser(doc_type_clean)
    parsed_data = parser_func(raw_ocr_text)

    # 8. Return structured JSON matching exact required schema
    return {
        "success": True,
        "documentType": doc_type_clean,
        "data": parsed_data,
        "ocrText": raw_ocr_text if raw_ocr_text else "Not Found",
        "message": "OCR Extraction Successful"
    }
