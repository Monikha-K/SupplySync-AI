from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="route-agent")


def get_coordinates(city):

    location = geolocator.geocode(city)

    if not location:
        return None

    return {
        "latitude": location.latitude,
        "longitude": location.longitude
    }