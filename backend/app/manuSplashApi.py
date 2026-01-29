import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
import requests  # HTTP client library for making API calls

load_dotenv()
VITE_API_URL = os.getenv("VITE_API_URL")

def get_leaderboard():
    """Ping splash scoring API to get the leaderboard data."""
    response = requests.get(VITE_API_URL + "/splash/leaderboard")
    data = response.json()
    return JSONResponse(content=data)

def __get_stats():
    """Ping splash scoring API to get the stats data."""
    response = requests.get(VITE_API_URL + "/splash/stats")
    data = response.json()
    return data 

def get_latest_jump():
    """Ping splash scoring API to get the latest jump score and username"""
    data = __get_stats()
    latest_jump = {
        "username": data["latest_username"],
        "score": data["latest_score"]
    }
    return latest_jump

def get_total_jumps():
    """Ping splash scoring API to get the total number of jumps recorded."""
    data = __get_stats()
    total_jumps = data["total_jumps"]
    return total_jumps








#!!!!!!!!!!!!!! DEPRECIATED CODE use only for testing when splash cam is offline!!!!!!!!!!!!!!#

# LEADERBOARD_FILE = os.path.join(os.path.dirname(__file__), "leaderboard.json")

# def get_leaderboard():
#     """Load and return the leaderboard data from the JSON file."""
#     if not os.path.exists(LEADERBOARD_FILE):
#         raise HTTPException(status_code=404, detail="Leaderboard file not found")

#     with open(LEADERBOARD_FILE, "r") as f:
#         lb = json.load(f)

#     # Convert full score into a whole number
#     for entry in lb:
#         entry["score"] = round(float(entry["score"]), 0)


#     return JSONResponse(content=lb)


# VIDEO_FILE = os.path.join(os.path.dirname(__file__), "latest.mp4")
# def get_latest_video():
#     """Return the latest video file recorded via the splash camera."""
#     if not os.path.exists(VIDEO_FILE):
#         raise HTTPException(status_code=404, detail="Video file not found")
    
#     return FileResponse(VIDEO_FILE)