import logging
from app.services.driving_license_parser import parse_driving_license
from app.services.rc_book_parser import parse_rc_book

logger = logging.getLogger(__name__)

def get_parser(document_type: str):
    """
    Factory function to return the appropriate parser callable based on document_type.

    Args:
        document_type (str): 'driving_license' or 'rc_book'

    Returns:
        function: Parser function accepting ocr_text string and returning dict
    """
    doc_type_clean = (document_type or "").strip().lower()

    if doc_type_clean == "driving_license":
        return parse_driving_license
    elif doc_type_clean == "rc_book":
        return parse_rc_book
    else:
        logger.warning(f"Unknown document type '{document_type}'. Defaulting to driving_license parser.")
        return parse_driving_license
