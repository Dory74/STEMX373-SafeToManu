"""
ManuMeter - Splash Scoring System

This module provides functionality for analyzing splash videos using computer vision
and the Segment Anything Model (SAM) to detect, measure, and score splashes.

The system processes video frames to identify splash areas, calculates various metrics
like area, convex hull area, height, and width, and assigns scores based on these
measurements. It uses a two-pass approach: first to find the approximate peak frame,
then a refined analysis around that frame.

Dependencies:
- OpenCV (cv2)
- NumPy
- PyTorch
- Pandas
- SAM 2 (Segment Anything Model)

Usage:
    python manumeter.py --video path/to/video.mp4
"""

import sys, os
import numpy as np
import argparse
import cv2
import torch
import numpy as np
import pandas as pd

# For using sam imports.
PROJECT_ROOT = "../"
sys.path.append(os.path.join(PROJECT_ROOT, "samfiles"))
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

# Create results folder
RESULTS_DIR = "../results"
os.makedirs(RESULTS_DIR, exist_ok=True)


# Measuring the splash based on the provided mask.
def measure_splash(mask):
    """
    Calculate dimensions of a splash mask.
    Returns:
        tuple: (area, hull_area, height, width)
            - area (int): Number of pixels in the mask
            - hull_area (int): Area of the convex hull of the splash
            - height (int): Height of the bounding box in pixels
            - width (N/A for now): Width of the bounding box in pixels
    """
    mask_uint8 = (mask.astype(np.uint8)) * 255
    # Number of pixels = area.
    area = int(mask.sum())

    # Coordinates of each pixel.
    ys, xs = np.where(mask)
    # Gets the height and width of the mask.
    height = int(ys.max() - ys.min()) if len(ys) else 0
    # Width is irrelevant now. Can be added later, but I don't believe it to be useful to scoring.
    width = int(xs.max() - xs.min()) if len(xs) else 0
    # Gets Mask contours.
    contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

    # Merge into one mask if theres more than 1 contour.
    if len(contours) > 1:
        merged = np.vstack([c.reshape(-1, 2) for c in contours])
        hull = cv2.convexHull(merged)
        hull_area = int(cv2.contourArea(hull))
    # If there is 1 countour this is correct, get the hull area.
    elif len(contours) == 1:
        hull = cv2.convexHull(contours[0])
        hull_area = int(cv2.contourArea(hull))
    # Can't find hull, area is 0
    else:
        hull_area = 0
    # Return values
    return area, hull_area, height, width

# Basic scoring system, based on my interpretation, subject to change.
# Max areas are adjusted based on first run throughs to ensure a proper scoring. (View scores.csv)
def manu_score(area, hull_area, height, AREA_MAX=10000, HULL_MAX=100000, HEIGHT_MAX=400):
    """
    Calculate a splash score based on measured metrics.

    The score is a weighted combination of normalized height, area, and convex hull area.
    Weights are: 60% height, 35% area, 5% convex hull area.

    Args:
        area (int): Pixel area of the splash
        hull_area (int): Area of the convex hull
        height (int): Height of the splash in pixels
        AREA_MAX (int): Maximum expected area
        HULL_MAX (int): Maximum expected hull area
        HEIGHT_MAX (int): Maximum expected height

    Returns:
        float: Score between 0 and 100
    """
    H = min(height / HEIGHT_MAX, 1.0) * 100
    A = min(area / AREA_MAX, 1.0) * 100
    C = min(hull_area / HULL_MAX, 1.0) * 100
    # Abstract scoring, will be adjusted later.
    score = 0.6 * H + 0.35 * A + 0.05 * C
    # Score must not exceed 100, as it is the max end of the scale.
    if score > 100:
        score = 100
    return score


# Using META's segment anything imports
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor


# SAM setup.
def load_sam(device):
    """
    Load the SAM 2 model for image segmentation.
    Returns:
        torch.nn.Module: The loaded SAM 2 model
    """
    sam2_checkpoint = "../samfiles/checkpoints/sam2.1_hiera_large.pt"
    model_cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"
    model = build_sam2(model_cfg, sam2_checkpoint, device=device)
    return model


# Processes the video and gets the relevant mask of each frame. The key to analysing the splashes.
def process_video(video_path, input_box, min_area=100):
    """
    Process a video to detect and score splashes using computer vision and SAM.

    This function performs a two-pass analysis:
    1. First pass: Quick scan with color thresholding to find approximate peak frame
    2. Second pass: Detailed analysis around peak frame using SAM for refinement

    Args:
        video_path (str): Path to the input video file
        input_box (numpy.ndarray): Bounding box [x1, y1, x2, y2] for splash detection region
        min_area (int): Minimum pixel area to consider as a valid splash (default: 100)

    Outputs (saved to results):
        - splash_overlay.mp4: Video with splash masks overlaid
        - best_splash_frame.png: Best frame image
        - best_splash_frame_with_mask.png: Best frame with mask overlay
        - scores.csv: Frame-by-frame scoring data
    """
    # Get video.
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: cannot open video")
        return

    # Video info
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Device setup
    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
    print("Using device:", device)
    model = load_sam(device)
    predictor = SAM2ImagePredictor(model)

    # Output video writer
    output_video_path = os.path.join(RESULTS_DIR, "splash_overlay.mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out_vid = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

    best_score = -1
    best_frame_img = None
    best_frame_mask = None
    best_frame_idx = -1
    scores_csv = []

    print("Processing video (First Pass)")

    # First pass: Quick skipping with basic masks... find peak frame.
    first_pass = 3
    approx_peak_score = -1
    approx_peak_idx = -1

    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    for idx in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            break
        if idx % first_pass != 0:
            continue

        # Simple masking using colours. Needs adjusting depending on environment.
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        #ADJUST 135 higher for brighter days, ADJUST 80 to filter out blues and greens
        #splash_mask = cv2.inRange(hsv, (0, 0, 220), (180, 80, 255))
        splash_mask = cv2.inRange(hsv, (0, 20, 220), (180, 40, 255)) 
        crop_mask = np.zeros_like(splash_mask)
        x1, y1, x2, y2 = input_box
        crop_mask[y1:y2, x1:x2] = splash_mask[y1:y2, x1:x2]
        splash_mask = crop_mask // 255
        # Measure the splash dimensions.
        area, hull_area, height_mask, width_mask = measure_splash(splash_mask)
        # If area is too small, score is 0, otherwise process normally.
        splash_score = (
            0
            if area < min_area
            else manu_score(area, hull_area, height_mask, width_mask)
        )
        # Track approximate peak frame.
        if splash_score > approx_peak_score:
            approx_peak_score = splash_score
            approx_peak_idx = idx

    print(
        f"First pass peak at frame {approx_peak_idx} (score : {approx_peak_score:.1f})"
    )

    # Second pass: Detailed analysis around peak frame with SAM.
    refine_range = 5
    start_idx = max(0, approx_peak_idx - refine_range)
    end_idx = min(frame_count, approx_peak_idx + refine_range + 1)

    # Process frames in the refined range.
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_idx)
    for idx in range(start_idx, end_idx):
        ret, frame = cap.read()
        if not ret:
            break

        # Color-based masking (different thresholds for second pass).
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        #splash_mask = cv2.inRange(hsv, (0, 0, 135), (180, 80, 255))
        splash_mask = cv2.inRange(hsv, (0, 40, 135), (180, 80, 255))  
        crop_mask = np.zeros_like(splash_mask)
        crop_mask[y1:y2, x1:x2] = splash_mask[y1:y2, x1:x2]
        splash_mask = crop_mask

        # Remove small blobs to reduce noise
        contours, _ = cv2.findContours(
            splash_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        # Create a clean mask by filtering contours based on area.
        clean_mask = np.zeros_like(splash_mask)
        for c in contours:
            if cv2.contourArea(c) >= min_area:
                cv2.drawContours(clean_mask, [c], -1, 255, -1)
        splash_mask = clean_mask // 255

        # SAM refinement for more accurate segmentation
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        predictor.set_image(rgb_frame)
        masks, scores, _ = predictor.predict(
            point_coords=None,
            point_labels=None,
            box=input_box[None, :],
            multimask_output=False,
        )
        # Combining masks for refinement (both from the SAM mask, and the mask generated from detecting bright areas.)
        if len(masks) > 0:
            sam_mask = masks[0]
            combined_mask = np.logical_and(splash_mask, sam_mask)
        # If SAM didn't work.
        else:
            combined_mask = splash_mask
        # Get values.
        area, hull_area, height_mask, width_mask = measure_splash(combined_mask)
        # Get score.
        splash_score = (
            0
            if area < min_area
            else manu_score(area, hull_area, height_mask, width_mask)
        )
        scores_csv.append([idx, splash_score, area, hull_area, height_mask, width_mask])

        # Track best frame.
        if splash_score > best_score:
            best_score = splash_score
            best_frame_img = frame.copy()
            best_frame_mask = combined_mask.copy()
            best_frame_idx = idx

        # Create video overlay with mask and annotations.
        mask_colour = np.zeros_like(frame)
        mask_colour[:, :, 2] = combined_mask * 255
        alpha = 0.5
        overlayed = cv2.addWeighted(frame, 1.0, mask_colour, alpha, 0)
        cv2.rectangle(overlayed, (x1, y1), (x2, y2), (0, 255, 0), 3)
        # Puts peak frame text on peak frame.
        if idx == best_frame_idx:
            cv2.putText(
                overlayed,
                f"PEAK FRAME {idx}",
                (50, 100),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.5,
                (0, 255, 255),
                3,
            )
        # Writes the current frame over the video.
        cv2.putText(
            overlayed,
            f"Frame {idx}: Height {height_mask}px, Score {splash_score:.1f}",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )
        out_vid.write(overlayed)
        print(f"Frame {idx}: score={splash_score:.1f}, height={height_mask} pixels, area={area} pixels")

    # Close video resources.
    cap.release()
    out_vid.release()

    # Save best frame images.
    if best_frame_img is not None and best_frame_mask is not None:
        mask_colour = np.zeros_like(best_frame_img)
        mask_colour[:, :, 2] = best_frame_mask * 255
        overlayed_best = cv2.addWeighted(best_frame_img, 1.0, mask_colour, alpha, 0)
        cv2.rectangle(overlayed_best, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.imwrite(
            os.path.join(RESULTS_DIR, "best_splash_frame_with_mask.png"), overlayed_best
        )
        cv2.imwrite(os.path.join(RESULTS_DIR, "best_splash_frame.png"), best_frame_img)

    # Save scoring data to CSV.
    df = pd.DataFrame(
        scores_csv, columns=["frame", "score", "area", "hull_area", "height", "width"]
    )
    df.to_csv(os.path.join(RESULTS_DIR, "scores.csv"), index=False)
    # Console for debugging.
    print(f"\nBest frame = {best_frame_idx} score = {best_score:.2f}")
    print(f"\nSaved in results/:")
    print("  splash_overlay.mp4")
    print("  best_splash_frame.png")
    print("  best_splash_frame_with_mask.png")
    print("  scores.csv")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze splash videos and generate scoring data")
    parser.add_argument("--video", type=str, required=True, help="Path to input video file")
    args = parser.parse_args()
    # Fixed box - this will need to be adjusted later when we have a set angle.
    #INPUT_BOX = np.array([400, 50, 1250, 650])
    # TEST
    INPUT_BOX = np.array([700, 200, 1000, 600])      
    #INPUT_BOX = np.array([900, 400, 1100, 550])
    process_video(args.video, INPUT_BOX)
