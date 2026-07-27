import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Safely import pdf2image to prevent application crash if not installed
try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logger.warning("pdf2image package is not installed. PDF processing will be disabled until installed.")

# Retrieve POPPLER_PATH from environment variables
POPPLER_PATH = os.getenv("POPPLER_PATH", None)

def is_pdf2image_available() -> bool:
    """
    Checks if pdf2image library is imported successfully.

    Returns:
        bool: True if available, False otherwise.
    """
    return PDF2IMAGE_AVAILABLE

def convert_pdf_to_images(pdf_path: str) -> list[str]:
    """
    Converts each page of a PDF document into temporary JPEG image files on disk.

    Args:
        pdf_path (str): Absolute or relative path to the PDF file.

    Returns:
        list[str]: A list of file paths to the generated temporary images.

    Raises:
        ImportError: If pdf2image module is missing.
        Exception: For any failure during PDF conversion or Poppler processing.
    """
    if not PDF2IMAGE_AVAILABLE:
        raise ImportError("PDF support is not installed. Please install pdf2image.")

    try:
        # Check if POPPLER_PATH exists and pass it to convert_from_path
        if POPPLER_PATH and os.path.exists(POPPLER_PATH):
            logger.info(f"Converting PDF using POPPLER_PATH: {POPPLER_PATH}")
            images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
        else:
            logger.info("Converting PDF using system PATH for Poppler")
            images = convert_from_path(pdf_path)

        temp_image_paths = []
        base_dir = os.path.dirname(pdf_path)
        file_basename = os.path.splitext(os.path.basename(pdf_path))[0]

        # Save each page as a separate temporary JPEG image file
        for i, image in enumerate(images):
            temp_image_name = f"{file_basename}_page_{i + 1}.jpg"
            temp_image_path = os.path.join(base_dir, temp_image_name)
            image.save(temp_image_path, "JPEG")
            temp_image_paths.append(temp_image_path)

        logger.info(f"Successfully converted {len(images)} PDF page(s) into images.")
        return temp_image_paths

    except Exception as e:
        logger.error(f"Failed to convert PDF to images for file {pdf_path}: {e}")
        raise e
