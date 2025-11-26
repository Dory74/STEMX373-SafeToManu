import requests
import os
from dotenv import load_dotenv

load_dotenv()
NIWA_API_KEY = os.getenv("NIWA_API_KEY")

if NIWA_API_KEY is None: 
    raise ValueError("NIWA_API_KEY not found in enviromental variables")

url = "https://api.niwa.co.nz/uv/data"

lat = "-37.68272674985233"
long = "176.17082423934843"

headers = {"x-apikey": NIWA_API_KEY}

params = {"lat": lat, "long": long}


response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    print("Succesfull response")
    
    data = response.json()
    for item in data["products"][0]["values"]:
        print(item)

    
else:
    print(f"Request failied with status code: {response.status_code}")