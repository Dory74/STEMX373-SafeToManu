import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json


BASE_URL = "http://sos.boprc.govt.nz/service?service=SOS&version=2.0.0&request=GetObservation&offering="
TIDE_HEIGHT_PATH = "Tide%20Height.ChartDatum@EP569596&observedProperty=Tide%20Height"
WATER_TEMP_PATH = "Water%20Temp.Primary@EP020617&observedProperty=Water%20Temp"
E_COLI_PATH = "E%20coli.LabResult@EP020617&observedProperty=E%20coli"
ENTEROCOCCI_PATH = "Ent.LabResult@EP020617&observedProperty=Enterococci"
FAECAL_COLIFORMS_PATH = "FC.LabResult@EP020617&observedProperty=Faecal%20coliforms"



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

    # Limit results to the last 24 hours up to the current day.
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


def get_e_coli():
    """Get the latest E. coli lab result."""
    url = generate_url(E_COLI_PATH)
    return request_from_url(url)


def get_enterococci():
    """Get the latest Enterococci lab result."""
    url = generate_url(ENTEROCOCCI_PATH)
    return request_from_url(url)


def get_faecal_coliforms():
    """Get the latest faecal coliforms lab result."""
    url = generate_url(FAECAL_COLIFORMS_PATH)
    return request_from_url(url)


def debug_urls():
    """Print and return the fully qualified URLs used by the data fetchers."""
    url_map = {
        "get_tide_height": generate_url(TIDE_HEIGHT_PATH),
        "get_water_temprature": generate_url(WATER_TEMP_PATH),
        "get_e_coli": generate_url(E_COLI_PATH),
        "get_enterococci": generate_url(ENTEROCOCCI_PATH),
        "get_faecal_coliforms": generate_url(FAECAL_COLIFORMS_PATH),
    }
    
    return url_map

# print(get_tide_height())
# print(get_water_temprature())
# print(get_e_coli())
# print(get_enterococci())
# print(get_faecal_coliforms())

print(json.dumps(debug_urls(), indent=4))
