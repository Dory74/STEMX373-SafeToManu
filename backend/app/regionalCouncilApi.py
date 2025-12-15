import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json


BASE_URL = "http://sos.boprc.govt.nz/service?service=SOS&version=2.0.0&request=GetObservation&offering="
TIDE_HEIGHT_PATH = "Tide%20Height.ChartDatum@EP569596&observedProperty=Tide%20Height"
WATER_TEMP_PATH = "Water%20Temp.Primary@EP020617&observedProperty=Water%20Temp"
ENTEROCOCCI_PATH = "Ent.Rec@EP095164&observedProperty=Enterococci"

ALERT_LEVEL_THRESHOLDS = {
    "1": 140, #Less than 140 safe to swim
    "2": 280 # between 140 and 280 be alert
              #Greater than 280- public warning status 
}


def request_from_url(url):
    """Call the given SOS endpoint and return the latest observation value."""
    
    response = requests.get(url)
    data = response.json()

    # return 1
    # Extract the final value from the observation series.
    values_array = data['observations'][0]['result']['values']
    latest_value = values_array[-1][-1]
    return latest_value


def generate_url(url):
    now = datetime.utcnow()  # current UTC time (API expects UTC)
    today_date = now.strftime("%Y-%m-%d")  # formatted yyyy-mm-dd

    # Limit results to the last 2 months up to the current day.
    url = (
        BASE_URL
        + url
        + f"&responseFormat=application/json&temporalFilter=om:phenomenonTime,P2m/{today_date}T"
        
    )
    return url
    


def get_tide_height():
    """Get the latest tide height from the regional council SOS service."""
    url = generate_url(TIDE_HEIGHT_PATH)
    return request_from_url(url)


def get_water_temprature():
    """Get the latest water temperature from the regional council SOS service."""
    url = generate_url(WATER_TEMP_PATH)
    return request_from_url(url)


def get_enterococci():
    """Get the latest Enterococci lab result."""
    url = generate_url(ENTEROCOCCI_PATH)
    enterococci_value = request_from_url(url) # Entercoli level
    threshold_1 = ALERT_LEVEL_THRESHOLDS["1"] # 140
    threshold_2 = ALERT_LEVEL_THRESHOLDS["2"] # 280

    # Level 1: Safe to swim
    if enterococci_value < threshold_1:
        return 1

    # Level 3: Public warning 
    elif enterococci_value > threshold_2:
        return 3

    # Level 2: Be alert 
    else: 
        return 2


def debug_urls():
    """Print and return the fully qualified URLs used by the data fetchers."""
    url_map = {
        "get_tide_height": generate_url(TIDE_HEIGHT_PATH),
        "get_water_temprature": generate_url(WATER_TEMP_PATH),
        "get_enterococci": generate_url(ENTEROCOCCI_PATH)
    }
    
    return url_map

# print(get_tide_height())
# print(get_water_temprature())
# print(get_e_coli())
# print(get_enterococci())
# print(get_faecal_coliforms())

# print(json.dumps(debug_urls(), indent=4))
