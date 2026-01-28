import requests
from datetime import datetime


BASE_URL = "http://sos.boprc.govt.nz/service?service=SOS&version=2.0.0&request=GetObservation&offering="
TIDE_HEIGHT_PATH = "Tide%20Height.ChartDatum@EP569596&observedProperty=Tide%20Height"
WATER_TEMP_PATH = "Water%20Temp.Primary@EP020617&observedProperty=Water%20Temp"
ENTEROCOCCI_PATH = "Ent.Rec@EP095164&observedProperty=Enterococci"



def __request_from_url(url):
    """Call the given SOS endpoint and return the latest observation value."""
    
    response = requests.get(url)
    data = response.json()

    # Extract the final value from the observation series.
    values_array = data['observations'][0]['result']['values']
    latest_value = values_array[-1][-1]
    return latest_value


def __generate_url(url):
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
    url = __generate_url(TIDE_HEIGHT_PATH)
    return __request_from_url(url)+3.5  # Adjust to chart datum


def get_water_temprature():
    """Get the latest water temperature from the regional council SOS service."""
    url = __generate_url(WATER_TEMP_PATH)
    return __request_from_url(url)


def get_enterococci():
    """Get the latest Enterococci lab result."""
    url = __generate_url(ENTEROCOCCI_PATH)
    enterococci_value = __request_from_url(url) # Entercoli level
    

    return enterococci_value


def __debug_urls():
    """Print and return the fully qualified URLs used by the data fetchers."""
    url_map = {
        "get_tide_height": __generate_url(TIDE_HEIGHT_PATH),
        "get_water_temprature": __generate_url(WATER_TEMP_PATH),
        "get_enterococci": __generate_url(ENTEROCOCCI_PATH)
    }
    
    return url_map

# print(get_tide_height())
# print(get_water_temprature())
# print(get_e_coli())
# print(get_enterococci())
# print(get_faecal_coliforms())

# print(json.dumps(__debug_urls(), indent=4))
