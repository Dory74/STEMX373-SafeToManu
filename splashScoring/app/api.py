import json
import logging
import os
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI()

LEADERBOARD_FILE = os.path.join(os.path.dirname(__file__), "leaderboard.json")

logger.info(f"Splash Scoring API initialized")
logger.info(f"Leaderboard file: {os.path.abspath(LEADERBOARD_FILE)}")


@app.get("/splash")
def root():
    logger.info("Health check endpoint called")
    return {"message": "Backend is running"}

def _safe_join(directory: str, filename: str) -> str:
    """Prevent path traversal by normalizing requested filenames."""
    cleaned = os.path.basename(filename)
    return os.path.join(directory, cleaned)


@app.get("/splash/leaderboard")
def get_leaderboard() -> List[dict]:
    """Load and return the leaderboard data from the JSON file."""
    if not os.path.exists(LEADERBOARD_FILE):
        raise HTTPException(status_code=404, detail="Leaderboard file not found")

    with open(LEADERBOARD_FILE, "r") as f:
        lb = json.load(f)

    # Convert full file paths to just filenames for frontend use
    for entry in lb:
        entry["video"] = os.path.basename(entry["video"])

    # Convert full score into a whole number
    for entry in lb:
        entry["score"] = round(float(entry["score"]), 0)


    return JSONResponse(content=lb)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
