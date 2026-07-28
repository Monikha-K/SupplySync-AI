from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable

geolocator = Nominatim(
    user_agent="route-agent",
    timeout=10
)


def get_coordinates(city):

    try:

        location = geolocator.geocode(city)

        if not location:
            return None

        return {
            "latitude": location.latitude,
            "longitude": location.longitude
        }

    except GeocoderUnavailable:

        raise Exception(
            "Geocoding service is temporarily unavailable. Please try again."
        )