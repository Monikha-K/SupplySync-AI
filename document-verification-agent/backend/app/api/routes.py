# API Routes for Document Verification
import os
import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.services.ocr_service import extract_text
from app.services.parser_factory import get_parser
from app.services.groq_service import verify_with_groq

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Document Verification Backend Running"}

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "OK"}

UPLOAD_DIR = "app/uploads"
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(None),
    documentType: str = Form("driving_license")
):
    """
    Uploads a document, runs EasyOCR, parses fields, sends to Groq for AI verification,
    and returns a comprehensive structured JSON response.
    """
    if not file:
        raise HTTPException(status_code=400, detail="File is missing")

    filename = file.filename or ""
    is_pdf = file.content_type == "application/pdf" or filename.lower().endswith('.pdf')
    is_image = file.content_type in ["image/png", "image/jpeg", "image/jpg"] or \
               filename.lower().endswith(('.png', '.jpg', '.jpeg'))

    doc_type_clean = (documentType or "driving_license").strip().lower()

    # RC Book only accepts PDF
    if doc_type_clean == "rc_book":
        if not is_pdf:
            return {
                "success": False,
                "message": "For RC Book only PDF files are supported."
            }
    else:
        if not (is_pdf or is_image):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed."
            )

    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds the maximum limit of 10 MB.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    # Step 1: OCR
    ocr_result = extract_text(file_path)
    if not ocr_result.get("success"):
        error_msg = ocr_result.get("message", "OCR Failed")
        return {
            "success": False,
            "documentType": doc_type_clean,
            "data": {},
            "aiVerification": {
                "status": "Unavailable",
                "overallTrustScore": 0,
                "verificationSummary": "OCR failed. AI verification unavailable.",
                "riskLevel": "Unknown",
                "documentQuality": "Unknown",
                "analysis": {},
                "recommendations": ["Re-upload the document."]
            },
            "ocrText": error_msg,
            "message": error_msg
        }

    raw_ocr_text = ocr_result.get("text", "")

    # Step 2: Parse fields
    parser_func = get_parser(doc_type_clean)
    parsed_data = parser_func(raw_ocr_text)

    # Step 3: Groq AI Verification (graceful failure)
    ai_verification = verify_with_groq(doc_type_clean, parsed_data)

    return {
        "success": True,
        "documentType": doc_type_clean,
        "data": parsed_data,
        "aiVerification": ai_verification,
        "ocrText": raw_ocr_text if raw_ocr_text else "Not Found",
        "message": "OCR Extraction Successful"
    }
