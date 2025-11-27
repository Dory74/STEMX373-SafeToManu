import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# load api key from .env file
load_dotenv()
NIWA_API_KEY = os.getenv("NIWA_API_KEY")

# Fail fast if the API key is missing so we don't send anonymous requests.
if NIWA_API_KEY is None: 
    raise ValueError("NIWA_API_KEY not found in enviromental variables")



def getUVIInfo(lat, long):
    """Call the NIWA UV API for a latitude/longitude pair."""
    
    url = "https://api.niwa.co.nz/uv/data"
    headers = {"x-apikey": NIWA_API_KEY}

    params = {"lat": lat, "long": long}
    
    response = requests.get(url, headers=headers, params=params)
    return response


def getUVIInfoChart(lat, long, skyType, save_path):
    """Call the NIWA UV API for a latitude/longitude pair."""
    
    url = "https://api.niwa.co.nz/uv/chart.png"
    headers = {"x-apikey": NIWA_API_KEY}

    params = {"lat": lat, "long": long, "sky": skyType}
    
    response = requests.get(url, headers=headers, params=params)
    
    with open(save_path, 'wb') as f:
            f.write(response.content)
    return

def formatUVIResponse(dateTime, uvValue):
    """Return a readable string for a single NIWA UV index reading."""

    # Render a tiny block with date, time and UV value.
    formatted = (
        "-------------\n"
        f"Date: {dateTime.strftime('%Y-%m-%d')}\n"
        f"Time: {dateTime.strftime('%I:%M %p')}\n"
        f"Value: {uvValue}\n"
        
    )
    return formatted


def processResponse(response, uvValueThreshhold, showToday):
    """Checks the response, if positive prints out a formated result of all the entrys"""
    if response.status_code == 200:
        print("Succesfull response")
    
        data = response.json()
        today = datetime.today()
        for item in data["products"][0]["values"]:
            if item['value'] > uvValueThreshhold:
                dt = datetime.fromisoformat(item["time"].replace("Z", "+00:00"))
                utcCorrection = timedelta(hours=13)
                dt = dt+utcCorrection
                if (showToday and dt.date() == today.date()) or not showToday:
                    print(formatUVIResponse(dt, item['value']))
            
    else:
        print(f"Request failied with status code: {response.status_code}")
        

# Example call for the strand,
lat = "-37.68272674985233"
long = "176.17082423934843"
response = getUVIInfo(lat, long)

processResponse(response, 0, True)
#getUVIInfoChart(lat, long, "clear", "chart.png")