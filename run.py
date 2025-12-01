import subprocess
import time
import datetime
import os
import sys

# Config (private, not pushed)





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

    ##Sending video to my computer

    print("Sending video to computer")

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    local_video = os.path.join(WIN_SAVE_DIR, f"splash_{timestamp}.mp4")

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

    print("\nFinished")


if __name__ == "__main__":
    main()
