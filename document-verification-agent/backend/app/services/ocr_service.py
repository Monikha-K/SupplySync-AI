import os
import logging
import easyocr
from app.services.pdf_service import convert_pdf_to_images, is_pdf2image_available

# Configure logging
logger = logging.getLogger(__name__)

# Initialize EasyOCR reader globally once to prevent high startup latency per request
try:
    reader = easyocr.Reader(['en'], gpu=False)
except Exception as e:
    logger.error(f"Failed to initialize EasyOCR Reader: {e}")
    reader = None

def extract_text(file_path: str) -> dict:
    """
    Extracts text from an image or PDF file using EasyOCR.
    Handles single/multi-page PDFs by converting pages to images first via pdf_service.py.

    Args:
        file_path (str): Path to the image or PDF document.

    Returns:
        dict: Status dict containing 'success', 'text', and optional 'message'.
    """
    if reader is None:
        logger.error("EasyOCR reader is uninitialized.")
        return {
            "success": False,
            "text": "OCR Failed",
            "message": "OCR Failed"
        }

    file_ext = os.path.splitext(file_path)[1].lower()

    # Process PDF File
    if file_ext == '.pdf':
        # 1. Check if pdf2image dependency is installed
        if not is_pdf2image_available():
            logger.error("pdf2image library is not available.")
            return {
                "success": False,
                "text": "PDF support is not installed. Please install pdf2image.",
                "message": "PDF support is not installed. Please install pdf2image."
            }

        # 2. Convert PDF pages into temporary image files
        try:
            temp_image_paths = convert_pdf_to_images(file_path)
        except ImportError as ie:
            return {
                "success": False,
                "text": str(ie),
                "message": str(ie)
            }
        except Exception as e:
            logger.error(f"PDF page conversion failed: {e}")
            return {
                "success": False,
                "text": "Unable to process PDF",
                "message": "Unable to process PDF"
            }

        # 3. Extract text from each converted page using EasyOCR
        extracted_pages_text = []
        try:
            for img_path in temp_image_paths:
                results = reader.readtext(img_path)
                page_text = [text for _, text, _ in results]
                if page_text:
                    extracted_pages_text.append("\n".join(page_text))

                # Clean up temporary page image
                if os.path.exists(img_path):
                    os.remove(img_path)

            # 4. Merge text from all pages
            merged_text = "\n".join(extracted_pages_text)
            return {
                "success": True,
                "text": merged_text
            }
        except Exception as e:
            logger.error(f"OCR processing failed for PDF pages: {e}")
            # Ensure cleanup of any remaining temp page images
            for img_path in temp_image_paths:
                if os.path.exists(img_path):
                    os.remove(img_path)
            return {
                "success": False,
                "text": "OCR Failed",
                "message": "OCR Failed"
            }

    # Process PNG / JPG / JPEG Image Files
    else:
        try:
            results = reader.readtext(file_path)
            extracted_text = [text for _, text, _ in results]
            combined_text = "\n".join(extracted_text)

            return {
                "success": True,
                "text": combined_text
            }
        except Exception as e:
            logger.error(f"OCR processing failed for image {file_path}: {e}")
            return {
                "success": False,
                "text": "OCR Failed",
                "message": "OCR Failed"
            }
