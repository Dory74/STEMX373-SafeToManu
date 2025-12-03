import sys, os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(PROJECT_ROOT, "samfiles"))
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

import numpy as np
import argparse
import cv2
from PIL import Image
import torch

# Create results folder
RESULTS_DIR = "results"
os.makedirs(RESULTS_DIR, exist_ok=True)

# Measuring the splash, important for scoring.
def measure_splash(mask):
    mask_uint8 = (mask.astype(np.uint8)) * 255
    area = int(mask.sum())

    ys, xs = np.where(mask)
    height = int(ys.max() - ys.min()) if len(ys) else 0
    width  = int(xs.max() - xs.min()) if len(xs) else 0

    contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

    if len(contours) > 1:
        merged = np.vstack([c.reshape(-1, 2) for c in contours])
        hull = cv2.convexHull(merged)
        hull_area = int(cv2.contourArea(hull))
    elif len(contours) == 1:
        hull = cv2.convexHull(contours[0])
        hull_area = int(cv2.contourArea(hull))
    else:
        hull_area = 0

    return area, hull_area, height, width


# Gets the splash measurements for scoring, width is pretty irrelevant
def manu_score(area, hull_area, height, width,
               AREA_MAX=150000, HULL_MAX=200000, HEIGHT_MAX=400, MAX_WIDTH=400):
    H = min(height / HEIGHT_MAX, 1.0) * 100
    A = min(area / AREA_MAX, 1.0) * 100
    C = min(hull_area / HULL_MAX, 1.0) * 100
    W = min(width / MAX_WIDTH, 1.0) * 100
    score = 0.9 * H + 0.05 * A + 0.03 * C + 0.02 * W
    
    if score > 100:
        score = 100
        
    return score



# Using META's segment anything imports
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor

def load_sam(device):
    sam2_checkpoint = "samfiles/checkpoints/sam2.1_hiera_large.pt"
    model_cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"
    model = build_sam2(model_cfg, sam2_checkpoint, device=device)
    return model


# Processing the input video.
def process_video(video_path, input_box, min_area=100):

    import cv2
    import numpy as np
    import pandas as pd

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: cannot open video")
        return

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

    # Video writer → results folder
    output_video_path = os.path.join(RESULTS_DIR, "splash_overlay.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out_vid = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

    best_score = -1
    best_frame_img = None
    best_frame_mask = None
    best_frame_idx = -1
    scores_csv = []

    print("Processing video...")

    for idx in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            break

        # Skip every 2nd frame for speed.
        if idx % 2 == 1:
            continue

        # Rudimentary colour filtering for masking - needs work.
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        splash_mask = cv2.inRange(hsv, (0, 0, 135), (180, 80, 255))

        # Crop to input box.
        x1, y1, x2, y2 = input_box
        crop_mask = np.zeros_like(splash_mask)
        crop_mask[y1:y2, x1:x2] = splash_mask[y1:y2, x1:x2]
        splash_mask = crop_mask

        # Remove small blobs.
        contours, _ = cv2.findContours(splash_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
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
            multimask_output=False
        )

        if len(masks) > 0:
            sam_mask = masks[0]
            combined_mask = np.logical_and(splash_mask, sam_mask)
        else:
            combined_mask = splash_mask

        # Measure splash.
        area, hull_area, height_mask, width_mask = measure_splash(combined_mask)
        splash_score = 0 if area < min_area else manu_score(area, hull_area, height_mask, width_mask)
        scores_csv.append([idx, splash_score, area, hull_area, height_mask, width_mask])

        # Track peak splash.
        if splash_score > best_score:
            best_score = splash_score
            best_frame_img = frame.copy()
            best_frame_mask = combined_mask.copy()
            best_frame_idx = idx

        # Overlay mask on image frame.
        # Overlay mask on image frame.
        mask_colour = np.zeros_like(frame)
        mask_colour[:, :, 2] = (combined_mask * 255)
        alpha = 0.5
        overlayed = cv2.addWeighted(frame, 1.0, mask_colour, alpha, 0)

        # --- Add bounding box to overlay ---
        x1, y1, x2, y2 = input_box
        cv2.rectangle(
            overlayed,
            (x1, y1), (x2, y2),
            (0, 255, 0),   # green box
            3              # thickness
        )


        # Highlight peak frame.
        if idx == best_frame_idx:
            cv2.putText(
                overlayed,
                f"PEAK FRAME {idx}",
                (50, 100),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.5,
                (0, 255, 255),
                3
            )

        # Add height text.
        cv2.putText(
            overlayed,
            f"Frame {idx}: Height {height_mask}px, Score {splash_score:.1f}",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

        out_vid.write(overlayed)
        print(f"Frame {idx}: score={splash_score:.1f}, height={height_mask}")

    cap.release()
    out_vid.release()

    print("\nBest frame =", best_frame_idx, "score =", best_score)

    # Save best frame overlay → results folder
    if best_frame_img is not None and best_frame_mask is not None:
        mask_colour = np.zeros_like(best_frame_img)
        mask_colour[:, :, 2] = (best_frame_mask * 255)
        overlayed_best = cv2.addWeighted(best_frame_img, 1.0, mask_colour, alpha, 0)

        # Add bounding box
        x1, y1, x2, y2 = input_box
        cv2.rectangle(
            overlayed_best,
            (x1, y1), (x2, y2),
            (0, 255, 0),
            3
        )

        cv2.imwrite(os.path.join(RESULTS_DIR, "best_splash_frame_with_mask.png"), overlayed_best)
        cv2.imwrite(os.path.join(RESULTS_DIR, "best_splash_frame.png"), best_frame_img)

    # Save CSV → results folder
    df = pd.DataFrame(scores_csv, columns=["frame", "score", "area", "hull_area", "height", "width"])
    df.to_csv(os.path.join(RESULTS_DIR, "scores.csv"), index=False)

    print("\nSaved in results/:")
    print("  splash_overlay.mp4")
    print("  best_splash_frame.png")
    print("  best_splash_frame_with_mask.png")
    print("  scores.csv")



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", type=str, required=True,
                        help="Path to a 5-second video clip")
    args = parser.parse_args()

    # Fixed box - this will need to be adjusted later when we have a set angle.
    INPUT_BOX = np.array([430, 450, 700, 1250])

    process_video(args.video, INPUT_BOX)
