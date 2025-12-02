from flask import Flask, jsonify, send_from_directory
import os
import json

app = Flask(__name__)

# Folder containing videos and leaderboard.json
WIN_SAVE_DIR = r"C:\Users\Jack\sam2\videos"
LEADERBOARD_FILE = os.path.join(WIN_SAVE_DIR, "leaderboard.json")

# Endpoint to get the current leaderboard
@app.route("/leaderboard")
def get_leaderboard():
    if not os.path.exists(LEADERBOARD_FILE):
        return jsonify([])

    with open(LEADERBOARD_FILE, "r") as f:
        lb = json.load(f)

    # Convert full file paths to just filenames for frontend use
    for entry in lb:
        entry["video"] = os.path.basename(entry["video"])

    return jsonify(lb)

# Endpoint to serve any video file from the folder
@app.route("/videos/<filename>")
def serve_video(filename):
    return send_from_directory(WIN_SAVE_DIR, filename)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
