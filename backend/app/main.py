from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse

import json
import os
from dotenv import load_dotenv

from . import uvApi
from . import regionalCouncilApi as regional
from . import manuSplashApi as splash
from . import metServiceApi as met

app = FastAPI()
latest_video_name = ''
LAT="-37.68272674985233"
LON="176.17082423934843"
load_dotenv()


origins = [
    "http://localhost:8230",
    "http://localhost:5173",
    "http://192.168.1.6:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.6:8230",
    "http://192.168.1.6:5080",
    "http://192.168.1.2:5173",
    "http://192.168.1.2:5080",


    # Cloudflare Zero Trust / deployed frontend hosts
    "https://manu.byteme.pro",
    "http://manu.byteme.pro",
    # VITE_API_URL,
    # VITE_FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
def root():
    return {"message": "Backend is running"}



# NIWA UV API endpoints
@app.get("/api/uv")
def get_uv():
    """Return the current-hour UV index for the provided Tauranga coordinates.\
    Returns:
        dict: {"lat": float, "long": float, "uv": float} UV index data
    """
    uv_value = uvApi.get_current_uv(str(LAT), str(LON))
    if uv_value is None:
        raise HTTPException(status_code=502, detail="Could not fetch UV value")
    # uvApi.get_uv_info_chart(lat, long, "clear", "chart.png")
    
    return {"lat": LAT, "long": LON, "uv": uv_value}


#BOP Regional Council API endpoints
@app.get("/api/tideHeight")
def get_current_tide_height():
    """Return the current tide height in metres.
    
    Returns:
        dict: {"height": float} Tide height in metres
    """
    height = regional.get_tide_height()
    return {"height": height}

@app.get("/api/waterTemp")
def get_current_tide_height():
    """Returns water temprature in degress celcius

    Returns:
        dict: {"temp": float} Water temprature in °C
    """
    temp = regional.get_water_temprature()
    return {"temp": temp}

@app.get("/api/enterococci")
def get_enterococci():
    """Return the current enterococci saftey level.

    Returns:
        string: "0" = Safe to swim
                "140" = Be alert
                "280" = Public warning
    """
    saftey_threshhold = regional.get_enterococci()
    return {"safteyLevel": saftey_threshhold}



# MetService API endpoints
@app.get("/api/windSpeed")
def get_current_wind_speed():
    """Return the current wind speed at in knots.
    Returns:
        dict: {"speed": float} Wind speed in m/s

    """
    speed = met.get_wind_10m(LAT, LON)
    return {"speed": speed}



# Manu Splash API endpoints
@app.get("/api/leaderboard")
def get_leaderboard():
    """Returns current top 3 manu scores 

    Returns:
        JSONResponse: Leaderboard data, see manuSplashApi.get_leaderboard() for format
    """
    return splash.get_leaderboard()

@app.get("/api/latestVideo")
def get_latest_video():
    """Returns the latest video recorded via the splash camera 

    Returns:
        FileResponse: Video file, .mp4 format
    """
    return splash.get_latest_video()