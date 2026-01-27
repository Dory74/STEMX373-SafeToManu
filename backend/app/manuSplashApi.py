import json
import os
from fastapi import HTTPException
from fastapi.responses import FileResponse, JSONResponse


LEADERBOARD_FILE = os.path.join(os.path.dirname(__file__), "leaderboard.json")

def get_leaderboard():
    """Load and return the leaderboard data from the JSON file."""
    if not os.path.exists(LEADERBOARD_FILE):
        raise HTTPException(status_code=404, detail="Leaderboard file not found")

    with open(LEADERBOARD_FILE, "r") as f:
        lb = json.load(f)

    # Convert full score into a whole number
    for entry in lb:
        entry["score"] = round(float(entry["score"]), 0)


    return JSONResponse(content=lb)


VIDEO_FILE = os.path.join(os.path.dirname(__file__), "latest.mp4")
def get_latest_video():
    """Return the latest video file recorded via the splash camera."""
    # ping jacks server for latest video, if its diffrent, then get it nad return it,else return nothing
    if not os.path.exists(VIDEO_FILE):
        raise HTTPException(status_code=404, detail="Leaderboard file not found")
    
    return FileResponse(VIDEO_FILE)