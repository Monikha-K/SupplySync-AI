import logging
import easyocr

# Configure logging
logger = logging.getLogger(__name__)

# Initialize EasyOCR globally to avoid reloading the model on each request
try:
    reader = easyocr.Reader(['en'], gpu=False)
except Exception as e:
    logger.error(f"Failed to initialize EasyOCR Reader: {e}")
    reader = None

def extract_text(file_path: str) -> dict:
    """
    Reads an image from file_path, extracts text using EasyOCR, and returns combined text.

    Args:
        file_path (str): Path to the image file.

    Returns:
        dict: A dictionary containing success status and extracted text.
    """
    if reader is None:
        logger.error("EasyOCR reader is not initialized.")
        return {
            "success": False,
            "text": "OCR Failed"
        }

    try:
        # readtext returns a list of tuples: (bbox, text, prob)
        results = reader.readtext(file_path)
        extracted_text = [text for _, text, _ in results]
        combined_text = "\n".join(extracted_text)

        return {
            "success": True,
            "text": combined_text
        }
    except Exception as e:
        logger.error(f"Error during OCR processing for file {file_path}: {e}")
        return {
            "success": False,
            "text": "OCR Failed"
        }
