from flask import Flask, jsonify, send_from_directory, abort
import os
import json

app = Flask(__name__)

WIN_SAVE_DIR = r"C:\Users\Jack\sam2\splashScoring\videos"
THUMBNAIL_DIR = r"C:\Users\Jack\sam2\splashScoring\results"
LEADERBOARD_FILE = os.path.join(WIN_SAVE_DIR, "leaderboard.json")


@app.route("/leaderboard")
def get_leaderboard():
    if not os.path.exists(LEADERBOARD_FILE):
        return jsonify([])

    with open(LEADERBOARD_FILE, "r") as f:
        lb = json.load(f)

    # Filenames
    for entry in lb:
        entry["video"] = os.path.basename(entry["video"])
        entry["thumbnail"] = os.path.basename(entry["thumbnail"])
       
    return jsonify(lb)


# Serve leaderboard videos
@app.route("/videos")
def list_videos():
    files = [f for f in os.listdir(WIN_SAVE_DIR) if f.endswith(".mp4")]
    return jsonify(files)


# Serve a specific video
@app.route("/videos/<filename>")
def serve_video(filename):
    file_path = os.path.join(WIN_SAVE_DIR, filename)
    if not os.path.exists(file_path):
        abort(404)
    return send_from_directory(WIN_SAVE_DIR, filename, as_attachment=False)


# Servethu mbnails
@app.route("/thumbnails")
def list_thumbnails():
    files = [f for f in os.listdir(WIN_SAVE_DIR) if f.endswith(".png")]
    return jsonify(files)


# Serve a specific thumbnail
@app.route("/thumbnails/<filename>")
def serve_thumbnail(filename):
    file_path = os.path.join(WIN_SAVE_DIR, filename)
    if not os.path.exists(file_path):
        abort(404)
    return send_from_directory(WIN_SAVE_DIR, filename, as_attachment=False)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
