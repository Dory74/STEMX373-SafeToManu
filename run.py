import subprocess
import time
import datetime
import os
import sys
import pandas as pd
import json
from operator import itemgetter


# Config


# Loads leaderboard file (if want to reset at end of the day could add delete at time function.)
def load_leaderboard():
    if os.path.exists(LEADERBOARD_FILE):
        with open(LEADERBOARD_FILE, "r") as f:
            return json.load(f)
    return []    

# Saves leaderboard in json.
def save_leaderboard(lb):
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(lb, f, indent=2)

def update_leaderboard(score, video_path):
    lb = load_leaderboard()
    lb.append({"score": score, "video": video_path})
    lb.sort(key=lambda x: x["score"], reverse=True)
    # Keep only top 3 scores.
    to_delete = lb[TOP_3:]
    lb = lb[:TOP_3]
    # Delete videos not in top 3.
    for entry in to_delete:
        if os.path.exists(entry["video"]):
            os.remove(entry["video"])
    # Saves the returned leaderboard.
    save_leaderboard(lb)
    return lb

def run_cmd(cmd):
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True
        )
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result.returncode
    except Exception as e:
        print(f"Command failed: {e}")
        return -1

def main():
    print("\n=== Starting Auto-Capture Pipeline ===\n")


    # Record Video
    print("Recording...")

    ffmpeg_cmd = (
        f"ssh {PI_USER}@{PI_IP} "
        f'ffmpeg -y -f v4l2 -framerate 60 -video_size 1280x720 '
        f'-i /dev/video0 -t 5 '
        f'-vf "eq=brightness=0.05:contrast=1.3:saturation=1.2" '
        f'-c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow '
        f'{PI_VIDEO_PATH}'
    )

    if run_cmd(ffmpeg_cmd) != 0:
        print("Error recording video.")
        return

    time.sleep(1)

    ##Sending video to my computer.

    print("Sending video to computer")

    local_video = os.path.join(WIN_SAVE_DIR, f"splash_.mp4")
    
    scp_cmd = (
        f"scp {PI_USER}@{PI_IP}:{PI_VIDEO_PATH} {local_video}"
    )

    if run_cmd(scp_cmd) != 0:
        print("Video wasn't downloaded.")
        return

    print(f"Saved video to: {local_video}\n")

    # Run algorithm to get masking.

    print("Running script")

    analysis_cmd = f'python "{PROCESS_SCRIPT}" --video "{local_video}"'

    if run_cmd(analysis_cmd) != 0:
        print("Error during analysis.")
        return

    # Grabs the highest score, needed for leaderboard.
    scores_csv = os.path.join(os.getcwd(), "scores.csv")
    if not os.path.exists(scores_csv):
        print("scores.csv not found. Cannot update leaderboard.")
        return

    # Read scores.
    df = pd.read_csv(scores_csv)
    max_score = df["score"].max()
    print(f"Max score for this video: {max_score:.1f}")

    # Load leadboard
    lb = load_leaderboard()
    # Append and sort scores
    lb.append({"score": max_score, "video": local_video})
    lb.sort(key=itemgetter("score"), reverse=True)

    # Keep only top 3.
    top_3 = lb[:TOP_3]
    to_delete = lb[TOP_3:]

    # Delete videos not in top 3.
    for entry in to_delete:
        if os.path.exists(entry["video"]):
            os.remove(entry["video"])

    # Rename top 3 videos to leaderboard position.
    for i, entry in enumerate(top_3, start=1):
        old_path = entry["video"]
        new_path = os.path.join(WIN_SAVE_DIR, f"{i}_manu.mp4")
        
        if old_path != new_path and os.path.exists(old_path):
            if os.path.exists(new_path):
                os.remove(new_path)
            os.rename(old_path, new_path)
        
        # Update entry path.
        entry["video"] = new_path

    # Save updated leaderboard.
    save_leaderboard(top_3)

    # Show updated leaderboard.
    print("Updated leaderboard:")
    for i, entry in enumerate(top_3, start=1):
        print(f"{i}: {entry['score']:.1f}")

    print("\nFinished")


if __name__ == "__main__":
    main()
