# ManuMeter

The ManuMeter is a splash scoring detection system that analyses splashes from video clips and assigns a score.

## Features

- Records video from a Raspberry Pi camera.
- Downloads and analyses videos using SAM2.
- Calculates splash scores based on a custom calculation involving the height, area, and hull area of the splash.
- Maintains and updates the leaderboard after each splash.

## Requirements

- Raspberry Pi with camera
- Python 3.x
- ffmpeg (for video recording)
- scp (for file transfer)
- SAM2 model and dependencies

## Installation



## Usage

To run the ManuMeter splash scoring pipeline:

```bash
python run.py
```

This one command will:
1. Record a 5-second video from the Raspberry Pi camera.
2. Download and send the video to the local machine.
3. Run the ManuMeter analysis using SAM2.
4. Update the leaderboard.

## Configuration

Edit the constants in `run.py` to configure:
- Raspberry Pi IP address and username
- File paths for videos and results
- Number of top scores to keep

## Output

- Scores are saved to `results/scores.csv`
- Leaderboard is maintained in `videos/leaderboard.json`
- Analysis results and best frames are stored in the `results/` directory