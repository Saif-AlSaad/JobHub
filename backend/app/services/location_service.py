import math
from typing import Dict, Tuple, Optional

# Bangladesh Tech Hub & University Coordinate Registry
LOCATION_COORDINATES: Dict[str, Tuple[float, float]] = {
    "dhaka": (23.8103, 90.4125),
    "savar": (23.8560, 90.2600),
    "daffodil smart city": (23.8767, 90.3204),
    "uttara": (23.8759, 90.3795),
    "mirpur": (23.8071, 90.3686),
    "dhanmondi": (23.7461, 90.3742),
    "banani": (23.7937, 90.4043),
    "gulshan": (23.7925, 90.4178),
    "mohakhali": (23.7776, 90.4005),
    "kawran bazar": (23.7516, 90.3944),
    "motijheel": (23.7330, 90.4172),
    "badda": (23.7806, 90.4267),
    "bashundhara": (23.8191, 90.4357),
    "chattogram": (22.3569, 91.7832),
    "sylhet": (24.8949, 91.8687),
    "rajshahi": (24.3745, 88.6042),
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) in kilometers.
    """
    R = 6371.0 # Radius of the earth in km

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 2)

def get_coordinates_for_location(location_name: str) -> Tuple[float, float]:
    """Retrieve approximate lat, lon for recognized city / area names."""
    if not location_name:
        return LOCATION_COORDINATES["dhaka"]
    
    loc_clean = location_name.lower().strip()
    for key, coords in LOCATION_COORDINATES.items():
        if key in loc_clean:
            return coords
    return LOCATION_COORDINATES["dhaka"]

def calculate_location_fit(
    seeker_lat: Optional[float],
    seeker_lon: Optional[float],
    job_lat: Optional[float],
    job_lon: Optional[float],
    is_remote: bool = False,
    alert_radius_km: float = 10.0
) -> Dict[str, any]:
    """
    Evaluates geographic suitability between candidate preference and job opportunity.
    Returns:
    - distance_km
    - is_nearby (within user configured alert radius)
    - score (0 to 100)
    - note (e.g. '3.4 km from your preferred location' or 'Remote Opportunity')
    """
    if is_remote:
        return {
            "distance_km": 0.0,
            "is_nearby": True,
            "score": 100.0,
            "note": "Remote opportunity (Accessible from anywhere)"
        }
    
    if seeker_lat is None or seeker_lon is None or job_lat is None or job_lon is None:
        return {
            "distance_km": None,
            "is_nearby": True,
            "score": 75.0,
            "note": "Location matching pending specific coordinates"
        }
    
    distance = haversine_distance(seeker_lat, seeker_lon, job_lat, job_lon)
    is_nearby = distance <= alert_radius_km

    # Proximity grading
    if distance <= 2.0:
        score = 100.0
    elif distance <= alert_radius_km:
        # Scale smoothly between 100 and 80
        score = 100.0 - ((distance / alert_radius_km) * 20.0)
    elif distance <= (alert_radius_km * 2):
        score = 65.0
    else:
        score = 40.0

    return {
        "distance_km": distance,
        "is_nearby": is_nearby,
        "score": round(score, 1),
        "note": f"{distance} km from your preferred location"
    }
