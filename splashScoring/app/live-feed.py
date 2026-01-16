import subprocess
import os
import numpy as np

PI_USER = "ju30"
PI_IP = "172.27.65.133"
FFPLAY_BIN = "C:/Users/Jack/AppData/Local/Microsoft/WinGet/Links/ffplay.exe"

INPUT_BOX = np.array([300, 200, 980, 520])

def run_live_stream():
    x1, y1, x2, y2 = INPUT_BOX
    width = x2 - x1
    height = y2 - y1

    print(f"Connecting to {PI_USER}@{PI_IP}...")
    print(f"Box: {x1},{y1}) to BR({x2},{y2})")

    drawbox_filter = f"drawbox=x={x1}:y={y1}:w={width}:h={height}:color=green:t=5"
    cmd = (
        f'ssh {PI_USER}@{PI_IP} '
        f'"ffmpeg -v error -f v4l2 -framerate 30 -i /dev/video0 -input_format mjpeg -video_size 1280x720 '
        f'-vf \\"{drawbox_filter}\\" '
        f'-f mpegts -codec:v mpeg1video -s 1280x720 -pix_fmt yuv420p -b:v 2000k -r 30 -bf 0 pipe:1" '
        f'| "{FFPLAY_BIN}" -i - -v error -noborder -alwaysontop -probesize 32 -analyzeduration 0 -sync ext -window_title "Pi Live Feed"'
    )
    try:
        subprocess.run(cmd, shell=True, check=True)
    except KeyboardInterrupt:
        print("\nStream stopped by user.")
    except subprocess.CalledProcessError as e:
        print(f"\nError starting stream: {e}")
        print("Check if the camera is currently recording in another script.")

if __name__ == "__main__":
    run_live_stream()