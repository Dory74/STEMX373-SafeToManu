import sys, os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(PROJECT_ROOT, "samfiles"))
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

import numpy as np
import torch
import matplotlib.pyplot as plt
from PIL import Image


# Measuring splash dimensions in mask
def measure_splash(mask):
    import cv2
    
    mask_uint8 = (mask.astype(np.uint8)) * 255

    area = int(mask.sum())

    ys, xs = np.where(mask)
    height = int(ys.max() - ys.min()) if len(ys) > 0 else 0
    width  = int(xs.max() - xs.min()) if len(xs) > 0 else 0

    # --- FIX: merge all splash blobs ---
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

# Manu scoring - subjective for now.
def manu_score(area, hull_area, height, width,
               AREA_MAX=150000, HULL_MAX=200000, HEIGHT_MAX=500):

    # Normalize 0–100
    H = min(height / HEIGHT_MAX, 1.0) * 100
    A = min(area / AREA_MAX, 1.0) * 100
    C = min(hull_area / HULL_MAX, 1.0) * 100

    # Weighted splash score
    score = 0.5 * H + 0.3 * A + 0.2 * C
    return score


if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

print(f"using device: {device}")

if device.type == "cuda":
    torch.autocast("cuda", dtype=torch.bfloat16).__enter__()
    if torch.cuda.get_device_properties(0).major >= 8:
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
elif device.type == "mps":
    print("\nWarning: MPS support is experimental in PyTorch.")

np.random.seed(3)

def show_mask(mask, ax, random_color=False, borders=True):
    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        color = np.array([30/255, 144/255, 255/255, 0.6])

    h, w = mask.shape[-2:]
    mask = mask.astype(np.uint8)
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)

    if borders:
        import cv2
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        contours = [cv2.approxPolyDP(contour, epsilon=0.01, closed=True) for contour in contours]
        mask_image = cv2.drawContours(mask_image, contours, -1, (1, 1, 1, 0.5), 2)

    ax.imshow(mask_image)

def show_points(coords, labels, ax, marker_size=375):
    pos = coords[labels == 1]
    neg = coords[labels == 0]
    ax.scatter(pos[:, 0], pos[:, 1], color='green', marker='*', s=marker_size, edgecolor='white')
    ax.scatter(neg[:, 0], neg[:, 1], color='red', marker='*', s=marker_size, edgecolor='white')

def show_box(box, ax):
    x0, y0 = box[0], box[1]
    w, h = box[2] - box[0], box[3] - box[1]
    ax.add_patch(plt.Rectangle((x0, y0), w, h, edgecolor='green', facecolor=(0,0,0,0), lw=2))


def show_masks(image, masks, scores, point_coords=None, box_coords=None, input_labels=None, borders=True):

    for i, (mask, model_score) in enumerate(zip(masks, scores)):

        plt.figure(figsize=(10, 10))
        plt.imshow(image)
        show_mask(mask, plt.gca(), borders=borders)

        if point_coords is not None:
            assert input_labels is not None
            show_points(point_coords, input_labels, plt.gca())

        if box_coords is not None:
            show_box(box_coords, plt.gca())

        # ------------------------------
        # Compute splash metrics + final score
        # ------------------------------
        area, hull_area, height, width = measure_splash(mask)
        splash_score = manu_score(area, hull_area, height, width)

        # Replace SAM2 confidence score with splash score
        title_text = (
            f"Manu Splash Score: {splash_score:.1f}/100\n"
            f"Height: {height}px | Area: {area} | Hull: {hull_area}"
            # If you want SAM2 mask confidence too:
            # f" | SAM2 confidence: {model_score:.3f}"
        )

        plt.title(title_text, fontsize=14)
        plt.axis('off')
        plt.show()



image = Image.open("best_splash_frame.png")
image = np.array(image.convert("RGB"))

from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor

sam2_checkpoint = "samfiles/checkpoints/sam2.1_hiera_large.pt"
model_cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"

sam2_model = build_sam2(model_cfg, sam2_checkpoint, device=device)
predictor = SAM2ImagePredictor(sam2_model)
predictor.set_image(image)

# Manu 1 input box
# input_box = np.array([320, 90, 500, 380])

input_box = np.array([692, 358, 916, 966])

masks, scores, _ = predictor.predict(
    point_coords=None,
    point_labels=None,
    box=input_box[None, :],
    multimask_output=False,
)

show_masks(image, masks, scores, box_coords=input_box)

print(predictor._features["image_embed"].shape,
      predictor._features["image_embed"][-1].shape)
