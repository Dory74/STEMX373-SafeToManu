from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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


    # Cloudflare Zero Trust / deployed frontend hosts
    "https://manu.byteme.pro",
    "http://manu.byteme.pro",

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



# NIWA UV API endpoint
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


#BOP Regional Council API endpoint
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


@app.get("/api/warning-level")
def get_warning_level():
    """Return the overall warning level based on water quality and other metrics.
    
    Warning Levels:
        1 = Good - Safe to swim
        2 = Moderate - Swim with discretion
        3 = Bad - Swimming not advised
    
    Returns:
        dict: {"level": int, "message": str}
    """
    # Get water quality as the primary metric
    water_quality = regional.get_enterococci()
    
    # Calculate warning level based on water quality thresholds
    # Can incorporate other metrics here in the future (UV, wind, etc.)
    if water_quality is None:
        level = 1
        message = "Waves clean • Sun shining • Conditions green"
    elif water_quality <= 140:
        level = 1
        message = "Waves clean • Sun shining • Conditions green"
    elif water_quality <= 280:
        level = 2
        message = "Elevated levels detected • Use caution • Check signage"
    else:
        level = 3
        message = "High contaminants detected • Swimming not advised"
    
    return {"level": level, "message": message}


# MetService API endpoints
@app.get("/api/windSpeed")
def get_current_wind_speed():
    """Return the current wind speed at in knots.
    Returns:
        dict: {"speed": float} Wind speed in m/s

    """
    speed = met.get_wind_10m(LAT, LON)
    return {"speed": speed}



# Depreciated, use only for testing when splash cam is offline


# # Manu Splash API endpoints
# @app.get("/api/leaderboard")
# def get_leaderboard():
#     """Returns current top 3 manu scores 

#     Returns:
#         JSONResponse: Leaderboard data, see manuSplashApi.get_leaderboard() for format
#     """
#     return splash.get_leaderboard()

# @app.get("/api/latestVideo")
# def get_latest_video():
#     """Returns the latest video recorded via the splash camera 

#     Returns:
#         FileResponse: Video file, .mp4 format
#     """
#     return splash.get_latest_video()