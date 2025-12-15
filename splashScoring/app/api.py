import json
import os
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse

app = FastAPI()

# Filepaths
WIN_SAVE_DIR = r"C:\Users\Jack\sam2\splashScoring\videos"
THUMBNAIL_DIR = r"C:\Users\Jack\sam2\splashScoring\results"
LEADERBOARD_FILE = os.path.join(WIN_SAVE_DIR, "leaderboard.json")


def _safe_join(directory: str, filename: str) -> str:
    """Prevent path traversal by normalizing requested filenames."""
    cleaned = os.path.basename(filename)
    return os.path.join(directory, cleaned)


@app.get("/leaderboard")
def get_leaderboard() -> List[dict]:
    if not os.path.exists(LEADERBOARD_FILE):
        return []

    with open(LEADERBOARD_FILE, "r") as f:
        leaderboard = json.load(f)

    for entry in leaderboard:
        entry["video"] = os.path.basename(entry["video"])
        entry["thumbnail"] = os.path.basename(entry["thumbnail"])

    return leaderboard


@app.get("/videos")
def list_videos() -> List[str]:
    return [f for f in os.listdir(WIN_SAVE_DIR) if f.endswith(".mp4")]


@app.get("/videos/{filename}")
def serve_video(filename: str) -> FileResponse:
    file_path = _safe_join(WIN_SAVE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(file_path, media_type="video/mp4")


@app.get("/thumbnails")
def list_thumbnails() -> List[str]:
    return [f for f in os.listdir(THUMBNAIL_DIR) if f.endswith(".png")]


@app.get("/thumbnails/{filename}")
def serve_thumbnail(filename: str) -> FileResponse:
    file_path = _safe_join(THUMBNAIL_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(file_path, media_type="image/png")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
