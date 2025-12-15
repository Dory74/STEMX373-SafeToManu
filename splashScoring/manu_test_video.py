import sys, os
import numpy as np
import argparse
import cv2
import torch
import numpy as np
import pandas as pd

# For using sam imports.
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(PROJECT_ROOT, "samfiles"))
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

# Create results folder
RESULTS_DIR = "results"
os.makedirs(RESULTS_DIR, exist_ok=True)


# Measuring the splash, important for scoring.
def measure_splash(mask):
    mask_uint8 = (mask.astype(np.uint8)) * 255
    # Number of pixels = area.
    area = int(mask.sum())

    # Coordinates of each pixel.
    ys, xs = np.where(mask)
    # Gets the height and width of the mask.
    height = int(ys.max() - ys.min()) if len(ys) else 0
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


# Gets the splash measurements for scoring, width is pretty irrelevant, could be removed.
def manu_score(
    area, hull_area, height, width, AREA_MAX=75000, HULL_MAX=150000, HEIGHT_MAX=800
):
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


# Sam setup.
def load_sam(device):
    sam2_checkpoint = "samfiles/checkpoints/sam2.1_hiera_large.pt"
    model_cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"
    model = build_sam2(model_cfg, sam2_checkpoint, device=device)
    return model


import time


def process_video(video_path, input_box, min_area=100):
    start_time = time.time()  # Start timer

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
        splash_mask = cv2.inRange(hsv, (0, 0, 135), (180, 80, 255))
        crop_mask = np.zeros_like(splash_mask)
        x1, y1, x2, y2 = input_box
        crop_mask[y1:y2, x1:x2] = splash_mask[y1:y2, x1:x2]
        splash_mask = crop_mask // 255

        area, hull_area, height_mask, width_mask = measure_splash(splash_mask)
        splash_score = (
            0
            if area < min_area
            else manu_score(area, hull_area, height_mask, width_mask)
        )

        if splash_score > approx_peak_score:
            approx_peak_score = splash_score
            approx_peak_idx = idx

    print(f"First pass peak at frame {approx_peak_idx} (score :{approx_peak_score:.1f})")

    # Second pass: 5 either side of peak frame.
    refine_range = 5
    start_idx = max(0, approx_peak_idx - refine_range)
    end_idx = min(frame_count, approx_peak_idx + refine_range + 1)

    cap.set(cv2.CAP_PROP_POS_FRAMES, start_idx)
    for idx in range(start_idx, end_idx):
        ret, frame = cap.read()
        if not ret:
            break

        # Simple masking using colours. Needs adjusting depending on environment.
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        splash_mask = cv2.inRange(hsv, (0, 0, 135), (180, 80, 255))
        crop_mask = np.zeros_like(splash_mask)
        crop_mask[y1:y2, x1:x2] = splash_mask[y1:y2, x1:x2]
        splash_mask = crop_mask

        # Remove small blobs.
        contours, _ = cv2.findContours(
            splash_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        clean_mask = np.zeros_like(splash_mask)
        for c in contours:
            if cv2.contourArea(c) >= min_area:
                cv2.drawContours(clean_mask, [c], -1, 255, -1)
        splash_mask = clean_mask // 255

        # SAM refinement.
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

        # Track best frame
        if splash_score > best_score:
            best_score = splash_score
            best_frame_img = frame.copy()
            best_frame_mask = combined_mask.copy()
            best_frame_idx = idx

        # Save video overlay.
        mask_colour = np.zeros_like(frame)
        mask_colour[:, :, 2] = combined_mask * 255
        alpha = 0.5
        overlayed = cv2.addWeighted(frame, 1.0, mask_colour, alpha, 0)
        cv2.rectangle(overlayed, (x1, y1), (x2, y2), (0, 255, 0), 3)
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
        print(
            f"Frame {idx}: score={splash_score:.1f}, height={height_mask} pixels, area={area} pixels"
        )

    # Close for resources.
    cap.release()
    out_vid.release()

    # Save best frame.
    if best_frame_img is not None and best_frame_mask is not None:
        mask_colour = np.zeros_like(best_frame_img)
        mask_colour[:, :, 2] = best_frame_mask * 255
        overlayed_best = cv2.addWeighted(best_frame_img, 1.0, mask_colour, alpha, 0)
        cv2.rectangle(overlayed_best, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.imwrite(
            os.path.join(RESULTS_DIR, "best_splash_frame_with_mask.png"), overlayed_best
        )
        cv2.imwrite(os.path.join(RESULTS_DIR, "best_splash_frame.png"), best_frame_img)

    # Save CSV.
    df = pd.DataFrame(
        scores_csv, columns=["frame", "score", "area", "hull_area", "height", "width"]
    )
    df.to_csv(os.path.join(RESULTS_DIR, "scores.csv"), index=False)

    print(f"\nBest frame = {best_frame_idx} score = {best_score:.2f}")
    print(f"\nSaved in results/:")
    print("  splash_overlay.mp4")
    print("  best_splash_frame.png")
    print("  best_splash_frame_with_mask.png")
    print("  scores.csv")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--video", type=str, required=True, help="Path to a 5-second video clip"
    )
    args = parser.parse_args()
    # Fixed box - this will need to be adjusted later when we have a set angle.
    INPUT_BOX = np.array([430, 450, 700, 1250])
    # INPUT_BOX = np.array([130, 450, 700, 1250])
    process_video(args.video, INPUT_BOX)
