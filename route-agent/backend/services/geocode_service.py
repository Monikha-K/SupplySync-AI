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


def reverse_geocode(lat, lon):

    try:

        location = geolocator.reverse((lat, lon), language="en")

        if not location:
            return None

        addr = location.raw.get("address", {})

        # Pick the most specific populated place name available
        city = (
            addr.get("city")
            or addr.get("town")
            or addr.get("village")
            or addr.get("county")
            or addr.get("state_district")
        )

        return city

    except Exception:
        return None
