import shutil
import subprocess
import time
import os
import json
import pandas as pd
from operator import itemgetter
import time

# Config.
PI_USER = "ju30"
# PI_IP = "10.191.8.5"
# PI_IP = "10.144.99.133"
# PI_IP = "10.130.66.133"
PI_IP = "172.27.65.133"
PI_VIDEO_PATH = "/home/ju30/splash.mp4"

# Filepaths.
WIN_SAVE_DIR = r"..\videos"
RESULTS_DIR = r"..\results"
PROCESS_SCRIPT = "manumeter.py"
SCORES_CSV = os.path.join(RESULTS_DIR, "scores.csv")
LEADERBOARD_FILE = os.path.join(WIN_SAVE_DIR, "leaderboard.json")
# Variable.
TOP_3 = 3


# Running console commands.
def run_cmd(cmd):
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"Command failed: {e}")
        return False


# Renaming without removing videos prematurely.
def safe_rename(src, dst, max_attempts=10):
    if not os.path.exists(src):
        print(f"Warning: source missing: {src}")
        return src

    base, ext = os.path.splitext(dst)

    for i in range(max_attempts + 1):
        attempt_path = dst if i == 0 else f"{base}_{i}{ext}"
        if not os.path.exists(attempt_path):
            os.rename(src, attempt_path)
            return attempt_path

    raise RuntimeError(f"Could not rename {src} → {dst}")


# Leaderboard Load
def load_leaderboard():
    if os.path.exists(LEADERBOARD_FILE):
        return json.load(open(LEADERBOARD_FILE, "r"))
    return []


# Dumps leaderboard into json
def save_leaderboard(lb):
    json.dump(lb, open(LEADERBOARD_FILE, "w"), indent=2)


def normalize_filenames():
    lb = load_leaderboard()
    if not lb:
        return

    # Sort by score
    lb.sort(key=lambda x: x["score"], reverse=True)

    #  Renaming
    for rank, entry in enumerate(lb, start=1):
        old_path = entry["video"]
        new_path = os.path.join(WIN_SAVE_DIR, f"{rank}_manu.mp4")

        # Skip if already correct name
        if os.path.abspath(old_path) == os.path.abspath(new_path):
            continue

        # If it already exists, remove it.
        if os.path.exists(new_path):
            os.remove(new_path)

        # Rename actual file
        if os.path.exists(old_path):
            os.rename(old_path, new_path)
            print(f"Normalized: {old_path} → {new_path}")

        # Update entry
        entry["video"] = new_path

    # Save cleaned leaderboard
    save_leaderboard(lb)


# Record video function.
def record_video():
    """Record video on the Pi."""
    print("Recording...")

    ffmpeg_cmd = (
        f"ssh {PI_USER}@{PI_IP} "
        f"ffmpeg -hide_banner -loglevel error "
        f"-y -f v4l2 "
        f"-input_format mjpeg "
        f"-video_size 1280x720 "
        f"-i /dev/video0 -t 5 "
        f'-vf "eq=brightness=0.05:contrast=1.3:saturation=1.2,fps=30" '
        f"-vsync cfr "
        f"-c:v libx264 -pix_fmt yuv420p "
        f"-crf 18 -preset veryfast "
        f"{PI_VIDEO_PATH}"
    )

    return run_cmd(ffmpeg_cmd)


# Download from PI.
def download_video():
    print("Downloading video...")

    local_path = os.path.join(WIN_SAVE_DIR, "splash_.mp4")
    scp_cmd = f'scp {PI_USER}@{PI_IP}:{PI_VIDEO_PATH} "{local_path}"'

    if run_cmd(scp_cmd):
        print(f"Saved video to: {local_path}")
        return local_path

    print("Video download failed.")
    return None


# Run script.
def analyze_video(local_video):
    print("Running algorithm...")
    # Runs the SAM2 video algorithm script.
    cmd = f'python "{PROCESS_SCRIPT}" --video "{local_video}"'
    # If that command doesn't exist, terminate.
    if not run_cmd(cmd):
        print("Error occured running algorithm script.")
        return None
    # If the scores.csv doesn't exist, terminate.
    if not os.path.exists(SCORES_CSV):
        print("scores.csv missing.")
        return None
    # Gets the max score from the scores.csv.
    df = pd.read_csv(SCORES_CSV)
    max_score = float(df["score"].max())
    # Returns the max score.
    print(f"Max score: {max_score:.1f}")
    return max_score


# Update the leaderboard with new scores.
def update_leaderboard(score, video_path):
    lb = load_leaderboard()

    # add new result
    lb.append(
        {
            "score": float(score),
            "video": video_path,
            "thumbnail": os.path.join(RESULTS_DIR, "best_splash_frame.png"),
        }
    )
    # Sort and keep top 3.
    lb.sort(key=itemgetter("score"), reverse=True)
    top3 = lb[:TOP_3]
    to_delete = lb[TOP_3:]

    # Delete removed entries.
    for e in to_delete:
        for key in ("video", "thumbnail"):
            p = e.get(key)
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except:
                    pass

    for rank, entry in reversed(list(enumerate(top3, start=1))):
        # Tries to safely rename video if another video has the same filename
        if os.path.exists(entry["video"]):
            new_video = os.path.join(WIN_SAVE_DIR, f"{rank}_manu.mp4")
            entry["video"] = safe_rename(entry["video"], new_video)
        # Tries to safely rename thumbnail if another video has the same filename
        if os.path.exists(entry["thumbnail"]):
            new_thumb = os.path.join(WIN_SAVE_DIR, f"{rank}_manu.png")
            # Skip copying if same file.
            if os.path.abspath(entry["thumbnail"]) != os.path.abspath(new_thumb):
                shutil.copy(entry["thumbnail"], new_thumb)
            entry["thumbnail"] = new_thumb
    # Updates the leaderboard.
    save_leaderboard(top3)
    print("\nUpdated leaderboard:")
    # Prints out the top 3.
    for i, e in enumerate(top3, start=1):
        print(f"{i}: Score={e['score']:.1f}, Video={os.path.basename(e['video'])}")


def main():

    start_time = time.time()

    # Writes to the console to show the program is starting.
    print("\nStarting\n")

    # If there is an issue recording video, terminate.
    if not record_video():
        return

    time.sleep(1)
    # If there is an issue downloading video, terminate.
    local_video = download_video()
    if not local_video:
        return

    # If there is an issue analysing video, terminate.
    score = analyze_video(local_video)
    if score is None:
        return

    # Update the leaderboard and rename the files when the analysis is finished.
    update_leaderboard(score, local_video)
    normalize_filenames()
    print("\nFinished.")
    end_time = time.time()
    elapsed = end_time - start_time
    minutes, seconds = divmod(elapsed, 60)
    print(f"\nFinished. Total runtime: {int(minutes)} min {seconds:.0f} sec")


if __name__ == "__main__":
    main()
