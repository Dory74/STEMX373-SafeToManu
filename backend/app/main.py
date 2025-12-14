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

load_dotenv()
# VITE_FRONTEND_URL = os.getenv("VITE_FRONTEND_URL")
# VITE_API_URL = os.getenv("VITE_API_URL")


origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://192.168.1.6:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.6:8230",
    "http://192.168.1.6:5080:",

    # Cloudflare Zero Trust / deployed frontend hosts
    "https://manu.byteme.pro",
    "http://manu.byteme.pro",
    "https://api.manu.byteme.pro",
    "http://api.manu.byteme.pro",
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


@app.get("/api/uv")
def get_uv(lat: float, long: float):
    """Return the current-hour UV index for the provided lat/long query parameters."""
    response = uvApi.get_uv_info(str(lat), str(long))
    uv_value = uvApi.current_hour_uv(response)
    if uv_value is None:
        raise HTTPException(status_code=502, detail="Could not fetch UV value")
    # uvApi.get_uv_info_chart(lat, long, "clear", "chart.png")
    
    return {"lat": lat, "long": long, "uv": uv_value}


@app.get("/api/tideHeight")
def get_current_tide_height():
    height = regional.get_tide_height()
    return {"height": height}

@app.get("/api/waterTemp")
def get_current_tide_height():
    temp = regional.get_water_temprature()
    return {"temp": temp}

@app.get("/api/enterococci")
def get_current_tide_height():
    saftey_threshhold = regional.get_enterococci()
    return {"safteyLevel": saftey_threshhold}




@app.get("/api/windSpeed")
def get_current_wind_speed(lat, lon):
    speed = met.get_wind_10m(lat, lon)
    return {"speed": speed}







LEADERBOARD_FILE = os.path.join(os.path.dirname(__file__), "leaderboard.json")

@app.get("/api/leaderboard")
def get_leaderboard():
    if not os.path.exists(LEADERBOARD_FILE):
        raise HTTPException(status_code=404, detail="Leaderboard file not found")

    with open(LEADERBOARD_FILE, "r") as f:
        lb = json.load(f)

    # Convert full file paths to just filenames for frontend use
    for entry in lb:
        entry["video"] = os.path.basename(entry["video"])

    return JSONResponse(content=lb)


VIDEO_FILE = os.path.join(os.path.dirname(__file__), "latest.mp4")
@app.get("/api/latestVideo")
def get_latest_video():
    # ping jacks server for latest video, if its diffrent, then get it nad return it,else return nothing
    if not os.path.exists(VIDEO_FILE):
        raise HTTPException(status_code=404, detail="Leaderboard file not found")
    
    return FileResponse(VIDEO_FILE)