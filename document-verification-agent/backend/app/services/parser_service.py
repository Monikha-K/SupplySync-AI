# Legacy compatibility entry point redirecting to driving_license_parser or parser_factory
from app.services.driving_license_parser import parse_driving_license as parse_driving_license_text

__all__ = ["parse_driving_license_text"]
