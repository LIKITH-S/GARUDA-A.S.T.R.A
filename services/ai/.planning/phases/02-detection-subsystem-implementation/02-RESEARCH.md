# Phase 2: Detection Subsystem Implementation - Research

**Researched:** 2026-06-11
**Domain:** OpenCV video processing, standalone RetinaFace detection, image normalization.
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Frame skipping interval must be a configurable parameter, defaulting to 5 (i.e., process every 5th frame).
- **D-02:** Resolution downscaling will not be applied; frames will be processed at their original resolution before face detection.
- **D-03:** The confidence threshold for face detection must be a configurable parameter, defaulting to 0.8.
- **D-04:** Preprocessing will utilize RetinaFace's built-in face alignment (`align=True` in `extract_faces`).
- **D-05:** Output face crop frames must be resized to exactly 112x112 pixels to match the input requirements of the ArcFace recognition model.

### the agent's Discretion
- Bounding box crop expansion parameter settings.
- Logger formatting and module-level try-except error catching structures to prevent video ingestion pipeline crashes on corrupt frames.
- Temporary file directories for temporary images used during intermediate pipeline steps.

### Deferred Ideas (OUT OF SCOPE)
- Live RTSP stream ingestion and reconnection logic — Deferred to Phase 4 (BEND-04).
- Multi-camera parallel stream dashboard — Out of scope.

</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Video frame extraction | API/Backend | — | Decodes video streams into individual frame arrays on the server. |
| Face detection (RetinaFace) | API/Backend | — | Performs model inference on individual frames to locate bounding boxes. |
| Bounding box cropping | API/Backend | — | Slices coordinate areas from frame arrays. |
| Image normalization (112x112) | API/Backend | — | Resizes and formats cropped images to match the ArcFace input shape. |

</architectural_responsibility_map>

<research_summary>
## Summary

This research outlines the implementation patterns for building a robust face detection pipeline in Python using OpenCV (`opencv-python-headless`) and the standalone `retina-face` library (version 0.0.18). The core objectives are extracting video frames programmatically, skipping frames efficiently to limit CPU load, executing face detection, and preparing standardized 112x112 BGR crops.

Key findings show that to skip frames efficiently in OpenCV, calling `cap.grab()` in a loop is significantly faster than decoding every frame with `cap.read()`. Furthermore, to avoid color channel distortion when passing crops as JPEG bytes to DeepFace (which loads files via standard libraries), we must preserve the BGR format before encoding via `cv2.imencode('.jpg', cropped_face)`.

**Primary recommendation:** Use `cv2.VideoCapture` with a `cap.grab()` loop for frame skipping, detect faces with `RetinaFace.detect_faces`, clamp coordinates to prevent index-out-of-bounds, and resize using `cv2.resize` to 112x112 before JPEG encoding.

</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| opencv-python-headless | 4.13.0.92 | Video decoding and image manipulation | Industry standard, lightweight for headless environments |
| retina-face | 0.0.18 | Standalone face detection | High precision face detection backend |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `cap.grab()` loop | `cap.set(cv2.CAP_PROP_POS_FRAMES)` | Seeking can be slow or inaccurate in keyframe-dependent compressed MP4 streams |
| Custom slicing | `RetinaFace.extract_faces` | Built-in extraction is less modular and doesn't decouple detection from cropping |

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
services/ai/detection/
├── __init__.py
├── video_service.py       # Ingests files and manages OpenCV VideoCapture
├── frame_extractor.py     # Performs frame extraction and skipping logic
├── face_detection.py      # Standalone RetinaFace wrapper
├── face_cropper.py        # Clamped coordinate cropping
└── preprocessing.py       # Image resizing and normalizations
```

### Pattern 1: OpenCV Frame Skipping
**What:** Use `cap.grab()` to bypass expensive frame decoding steps.
**When to use:** Whenever processing high-frame-rate video streams where only a subset of frames (every Nth frame) is analyzed.
**Example:**
```python
import cv2

def extract_skipped_frames(video_path, skip_interval=5):
    cap = cv2.VideoCapture(video_path)
    frame_idx = 0
    try:
        while cap.isOpened():
            # Skip N-1 frames
            for _ in range(skip_interval - 1):
                grabbed = cap.grab()
                if not grabbed:
                    return
                frame_idx += 1
            
            # Read and decode the Nth frame
            ret, frame = cap.read()
            if not ret:
                break
            
            yield frame, frame_idx
            frame_idx += 1
    finally:
        cap.release()
```

### Pattern 2: RetinaFace Detection and Crop Clamping
**What:** Detect faces and clamp bounding box coordinates to image dimensions.
**When to use:** Safe cropping to prevent Python slice index overflows/errors.
**Example:**
```python
from retinaface import RetinaFace
import numpy as np

def detect_and_crop(frame: np.ndarray, threshold=0.8):
    h, w = frame.shape[:2]
    # detect_faces returns a dict mapping "face_1", "face_2" to coordinates
    detections = RetinaFace.detect_faces(frame, threshold=threshold)
    crops = []
    
    if not isinstance(detections, dict):
        return crops
        
    for face_id, info in detections.items():
        box = info.get("facial_area") # [x1, y1, x2, y2]
        if not box:
            continue
        
        # Clamp coordinates
        x1 = max(0, int(box[0]))
        y1 = max(0, int(box[1]))
        x2 = min(w, int(box[2]))
        y2 = min(h, int(box[3]))
        
        crop = frame[y1:y2, x1:x2]
        crops.append(crop)
    return crops
```

### Anti-Patterns to Avoid
- **Decoding skipped frames:** Using `cap.read()` inside a skipping loop decodes H.264 data unnecessarily, saturating CPU.
- **Unclamped Slicing:** Slicing arrays with negative indices or out-of-bounds coordinates (which RetinaFace occasionally yields) can lead to distorted or empty crop dimensions.
- **Swapped color channels:** Converting to RGB before encoding with `cv2.imencode` will result in blue-shifted facial embeddings since standard file loaders assume BGR inputs.

</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video frame decoding | Custom binary demuxer | OpenCV (`cv2.VideoCapture`) | Handling diverse codecs, audio sync, and container parsing is extremely complex. |
| Face detection | Custom CNN or Haar Cascades | Standalone RetinaFace | Pre-trained weights, robust occlusion handling, and high alignment accuracy. |

</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Empty Face Detections
- **What goes wrong:** RetinaFace returns `None` or an empty list/dict, causing attribute errors (e.g. `AttributeError: 'NoneType' object has no attribute 'items'`).
- **How to avoid:** Always type-check the output of `detect_faces` to ensure it is a dictionary before calling `.items()`.

### Pitfall 2: Memory Leak with VideoCapture
- **What goes wrong:** Open file handles or unreleased VideoCapture instances leak system resources.
- **How to avoid:** Wrap the frame extraction loop in a `try...finally` block that guarantees `cap.release()` is called.

</common_pitfalls>

<code_examples>
## Code Examples

### Standard RetinaFace Usage
```python
from retinaface import RetinaFace

# Standalone detection on image array
img = cv2.imread("sample.jpg")
faces = RetinaFace.detect_faces(img, threshold=0.8)
for face_id, info in faces.items():
    print(face_id, "facial area:", info["facial_area"])
```

### JPEG Encoding Crop for Ingestion
```python
import cv2

def prepare_crop_bytes(crop_frame):
    # Resize to ArcFace standard target size
    resized = cv2.resize(crop_frame, (112, 112))
    # Encode as JPEG
    success, buffer = cv2.imencode('.jpg', resized)
    if not success:
        raise ValueError("Failed to encode crop")
    return buffer.tobytes()
```

</code_examples>

<sources>
## Sources

### Primary (HIGH confidence)
- `retina-face` PyPI Documentation — Library usage and API verification.
- OpenCV Documentation — VideoCapture grab/retrieve methods.

</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: OpenCV Video Ingestion, Standalone RetinaFace
- Patterns: Frame skipping, Safe Crop Clamping, BGR to JPEG encoding

**Confidence breakdown:**
- Standard stack: HIGH — packages pre-installed and verified
- Architecture: HIGH — tested imports and signatures locally

**Research date:** 2026-06-11
**Valid until:** 2026-07-11
</metadata>

---

*Phase: 02-detection-subsystem-implementation*
*Research completed: 2026-06-11*
*Ready for planning: yes*
