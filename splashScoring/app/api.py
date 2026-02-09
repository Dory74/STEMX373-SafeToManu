import json
import logging
import os
import subprocess
from typing import List

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI()

LEADERBOARD_FILE = os.path.join(os.path.dirname(__file__), "leaderboard.json")
STATS_FILE = os.path.join(os.path.dirname(__file__), "stats.json")

logger.info(f"Splash Scoring API initialized")
logger.info(f"Leaderboard file: {os.path.abspath(LEADERBOARD_FILE)}")


@app.get("/splash")
def root():
    logger.info("Health check endpoint called")
    return {"message": "Backend is running"}



@app.get("/splash/leaderboard")
def get_leaderboard() -> List[dict]:
    """Load and return the leaderboard data from the JSON file."""
    if not os.path.exists(LEADERBOARD_FILE):
        raise HTTPException(status_code=404, detail="Leaderboard file not found")

    with open(LEADERBOARD_FILE, "r") as f:
        lb = json.load(f)

    # Convert full score into a whole number
    for entry in lb:
        entry["score"] = round(float(entry["score"]), 0)


    return JSONResponse(content=lb)


@app.get("/splash/stats")
def get_stats() -> dict:
    """Load and return the stats data from the JSON file."""
    if not os.path.exists(STATS_FILE):
        raise HTTPException(status_code=404, detail="Stats file not found")

    with open(STATS_FILE, "r") as f:
        stats = json.load(f)

    return JSONResponse(content=stats)


@app.post("/splash/run")
def trigger_run(background_tasks: BackgroundTasks):
    """Trigger run.py to record, analyze, and update the leaderboard."""
    logger.info("Run endpoint triggered - starting splash recording pipeline")
    
    def run_pipeline():
        try:
            script_path = os.path.join(os.path.dirname(__file__), "run.py")
            logger.info(f"Executing run.py at: {script_path}")
            result = subprocess.run(
                ["python", script_path],
                cwd=os.path.dirname(__file__),
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                logger.info("run.py completed successfully")
                logger.info(f"Output: {result.stdout}")
            else:
                logger.error(f"run.py failed with code {result.returncode}")
                logger.error(f"Stderr: {result.stderr}")
        except Exception as e:
            logger.error(f"Error running pipeline: {e}")
    
    background_tasks.add_task(run_pipeline)
    return {"message": "Splash recording pipeline started", "status": "running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
