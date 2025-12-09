import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json


def request_from_url(url):
    """Call the given SOS endpoint and return the latest observation value."""
    now = datetime.utcnow()  # current UTC time (API expects UTC)
    today_date = now.strftime("%Y-%m-%d")  # formatted yyyy-mm-dd

    # Limit results to the last 24 hours up to the current day.
    url = url + f"&temporalFilter=om:phenomenonTime,P1d/{today_date}T"
    response = requests.get(url)
    data = response.json()

    # Extract the final value from the observation series.
    values_array = data['observations'][0]['result']['values']
    latest_value = values_array[-1][-1]
    return latest_value


def get_tide_height():
    """Get the latest tide height from the regional council SOS service."""
    url = "http://sos.boprc.govt.nz/service?service=SOS&version=2.0.0&request=GetObservation&offering=Tide%20Height.ChartDatum@EP569596&observedProperty=Tide%20Height&responseFormat=application/json"
    return request_from_url(url)


def get_water_temprature():
    """Get the latest water temperature from the regional council SOS service."""
    url = "http://sos.boprc.govt.nz/service?service=SOS&version=2.0.0&request=GetObservation&offering=Water%20Temp.Primary@EP020617&observedProperty=Water%20Temp&responseFormat=application/json"
    return request_from_url(url)


# get_tide_height()
# get_water_temprature()
