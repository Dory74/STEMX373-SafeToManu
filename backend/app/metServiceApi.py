import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
METSERVICE_API_KEY = os.getenv("METSERVICE_API_KEY")

if METSERVICE_API_KEY is None:
    raise ValueError("METSERVICE_API_KEY not found in enviromental variables")
