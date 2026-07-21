"""Calcul de distance, durée et heure d'arrivée estimée.

À brancher sur un fournisseur externe (Google Maps Distance Matrix,
Mapbox Directions, OSRM...). L'implémentation ci-dessous est un point
d'extension unique : tout le reste du code appelle uniquement
`compute_route`, donc changer de fournisseur ne touche que ce fichier.
"""

from dataclasses import dataclass


@dataclass
class RouteEstimate:
    distance_km: float
    duration_minutes: float


def compute_route(
    origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float
) -> RouteEstimate:
    """Retourne la distance et la durée estimées entre deux points.

    TODO: remplacer par un appel réel à l'API de routage choisie.
    Exemple avec Google Maps Distance Matrix API :

        response = httpx.get(
            "https://maps.googleapis.com/maps/api/distancematrix/json",
            params={
                "origins": f"{origin_lat},{origin_lng}",
                "destinations": f"{dest_lat},{dest_lng}",
                "key": settings.GOOGLE_MAPS_API_KEY,
            },
        )
        ...
    """
    # Placeholder : distance à vol d'oiseau (formule de Haversine) x 1.3
    # comme facteur de correction routier, en attendant l'intégration réelle.
    import math

    r = 6371  # rayon terrestre en km
    d_lat = math.radians(dest_lat - origin_lat)
    d_lng = math.radians(dest_lng - origin_lng)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(origin_lat))
        * math.cos(math.radians(dest_lat))
        * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    straight_line_km = r * c
    road_distance_km = round(straight_line_km * 1.3, 2)

    average_speed_kmh = 35
    duration_minutes = round((road_distance_km / average_speed_kmh) * 60, 1)

    return RouteEstimate(distance_km=road_distance_km, duration_minutes=duration_minutes)
