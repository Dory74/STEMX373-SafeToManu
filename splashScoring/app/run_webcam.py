import os
import cv2
import subprocess
from datetime import datetime

# ---------- SETTINGS ----------
VIDEOS_FOLDER = r"C:\Users\Jack\sam2\videos"
VIDEO_FILENAME = "splash_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".mp4"
VIDEO_PATH = os.path.join(VIDEOS_FOLDER, VIDEO_FILENAME)

PROCESS_SCRIPT = r"C:\Users\Jack\sam2\manu_test_video.py"

CAPTURE_SECONDS = 5
FPS = 30
WIDTH = 1280
HEIGHT = 720
MIN_AREA = 100

# ----------------------------------

os.makedirs(VIDEOS_FOLDER, exist_ok=True)

print("\n=== Starting Webcam Capture Pipeline ===\n")

# 1️⃣ Capture video from webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("Cannot open webcam!")

# Set resolution and FPS
cap.set(cv2.CAP_PROP_FRAME_WIDTH, WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)
cap.set(cv2.CAP_PROP_FPS, FPS)

frame_count = int(FPS * CAPTURE_SECONDS)
out = cv2.VideoWriter(
    VIDEO_PATH,
    cv2.VideoWriter_fourcc(*'mp4v'),
    FPS,
    (WIDTH, HEIGHT)
)

print(f"Recording {CAPTURE_SECONDS} seconds from webcam...")

for _ in range(frame_count):
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break
    out.write(frame)

cap.release()
out.release()
print(f"Saved video to: {VIDEO_PATH}\n")

# 2️⃣ Run splash analysis
print("Running splash analysis...")
subprocess.run([
    "python",
    PROCESS_SCRIPT,
    "--video",
    VIDEO_PATH
], check=True)

print("\n=== DONE ===")
