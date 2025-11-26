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

def formatUVIResponse(entry):
    """Return a readable string for a single NIWA UV index reading."""
    dt = datetime.fromisoformat(entry["time"].replace("Z", "+00:00"))
    utcCorrection = timedelta(hours=13)
    dt = dt+utcCorrection

    # Render a tiny block with date, time and UV value.
    formatted = (
        "-------------\n"
        f"Date: {dt.strftime('%Y-%m-%d')}\n"
        f"Time: {dt.strftime('%I:%M %p')}\n"
        f"Value: {entry['value']}\n"
        
    )
    return formatted


def processResponse(response):
    """Checks the response, if positive prints out a formated result of all the entrys"""
    if response.status_code == 200:
        print("Succesfull response")
    
        data = response.json()
        
        for item in data["products"][0]["values"]:
            if item['value'] != 0:
                print(formatUVIResponse(item))
            
    else:
        print(f"Request failied with status code: {response.status_code}")
        

# Example call for the strand,
lat = "-37.68272674985233"
long = "176.17082423934843"
response = getUVIInfo(lat, long)

processResponse(response)
getUVIInfoChart(lat, long, "clear", "chart.png")