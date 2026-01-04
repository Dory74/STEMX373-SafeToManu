import requests
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timezone

load_dotenv()
METSERVICE_API_KEY = os.getenv("METSERVICE_API_KEY")
LAT = os.getenv("VITE_LAT")
LON = os.getenv("VITE_LON")

if METSERVICE_API_KEY is None:
    raise ValueError("METSERVICE_API_KEY not found in environment variables")

def __now_utc():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def __request_wind_10m(lat: str, lon: str):
    """
    Fetch 10 m wind speed from the MetOcean Point API.
    Correct format: POST + JSON body.
    """
    url = "https://forecast-v2.metoceanapi.com/point/time"

    headers = {
        "x-api-key": METSERVICE_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "points": [
            {"lon": float(lon), "lat": float(lat)}
        ],
        "variables": ["wind.speed.at-10m"],
        "time": {
            "from": __now_utc(),
            "interval": "1h",
            "repeat": 0
        },
        "baseModels": {
            "atmospheric": "auto",
            "wave": "auto"
        },
        "accessLevel": 10,
        "explain": True,
        "cycleLock": "group",
        "joinModels": True
    }

    response = requests.post(url, headers=headers, data=json.dumps(body))
    response.raise_for_status()

    return response.json()

def get_wind_10m(lat, lon):
    
    print(f"Lat: {lat}, Lon: {lon}")
    
    data = __request_wind_10m(lat, lon)
    speed_ms = data['variables']['wind.speed.at-10m']['data'][0]
    speed_knots = speed_ms * 1.94384
    
    return round(speed_knots, 2)


# print(json.dumps(data, indent=4))
#print(data['variables']['wind.speed.at-10m']['data'][0])
# print(get_wind_10m(LAT, LON))
#print(f"Lat: {LAT}, Lon: {LON}")
