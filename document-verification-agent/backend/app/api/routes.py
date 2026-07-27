# API Routes for Document Verification
import os
from fastapi import APIRouter, File, UploadFile, HTTPException

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
ALLOWED_CONTENT_TYPES = ["application/pdf", "image/png", "image/jpeg"]
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(None)):
    """
    Uploads a document (PDF, PNG, JPG/JPEG) to the server.
    Validates file presence, type, and size (max 10MB).
    Saves the valid file into the 'app/uploads/' directory.
    """
    # 1. Check if file is missing
    if not file:
        raise HTTPException(status_code=400, detail="File is missing")

    # 2. Validate file type (JPG usually has image/jpeg MIME type)
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed."
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

    # 6. Save the file to the disk
    # We use os.path.join to securely append the filename
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    # 7. Return success response
    return {
        "success": True,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": file_size,
        "message": "File uploaded successfully"
    }
