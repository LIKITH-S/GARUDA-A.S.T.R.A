# Stack Research

**Domain:** Computer Vision / Facial Recognition and Detection Subsystems
**Researched:** 2026-06-10
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Python | 3.10+ | Primary runtime | Standard environment for machine learning, OpenCV, and deep learning libraries. |
| TensorFlow / Keras | 2.16+ (via `tf-keras`) | Model backend | Needed to run the ArcFace weights for recognition and RetinaFace for detection. |
| OpenCV (headless) | 4.9.0+ (`opencv-python-headless`) | Video decoding and image processing | De facto standard for video ingestion, frame extraction, image cropping, and resizing without needing a GUI/display server. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `retina-face` | 0.0.17+ | Standalone face detection | Used in the detection pipeline to locate faces in frames with high accuracy under varying lighting and pose conditions. |
| `deepface` | 0.0.92+ | ArcFace face recognition wrapper | Used in the recognition pipeline to load model weights and extract 512-dim facial vectors. |
| `scipy` | 1.12.0+ | Vector distance calculations | Computes the cosine distance (`scipy.spatial.distance.cosine`) between facial embeddings. |
| `numpy` | 1.26.0+ | Array and frame buffer manipulation | Fast manipulation of image pixel values, dimensions, cropping slices, and color spaces. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `pytest` | Unit testing | Run test suites on similarity math, preprocessors, and mock pipelines. |
| `uv` | Dependency manager | Extremely fast pip alternative to set up and manage virtual environments. |

## Installation

```bash
# Core & Supporting dependencies
pip install opencv-python-headless tensorflow tf-keras numpy scipy deepface retina-face
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Standalone `retina-face` library | DeepFace built-in RetinaFace backend | If we want to fully unify all model invocations under a single DeepFace wrapper without installing `retina-face` separately. (Rejected to keep the detection pipeline standalone and independent). |
| OpenCV Video Ingestion | PyAV (FFmpeg python bindings) | If CPU decoding overhead becomes a major bottleneck and hardware-accelerated video decoding (NVDEC) is needed. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Haar Cascades (`cv2.CascadeClassifier`) | Very high false-positive rate and poor accuracy for non-frontal faces or varying CCTV angles. | RetinaFace / Standalone face detectors. |
| `dlib` CNN face detector | Extremely slow on CPUs and has complex C++ compilation dependencies (CMake) which fail frequently on Windows/macOS. | RetinaFace or MTCNN. |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `retina-face` | `tensorflow>=2.0.0` | Relies on TensorFlow backend for inference. |
| `deepface` | `tf-keras` (TF 2.16+) | TensorFlow 2.16+ requires explicit `tf-keras` package for Keras imports. |

## Sources

- [PyPI retina-face](https://pypi.org/project/retina-face/) — verified latest release version.
- [DeepFace Official Docs](https://github.com/serengil/deepface) — verified TensorFlow / Keras 3 version compatibility and ArcFace models.

---
*Stack research for: Computer Vision / Facial Recognition*
*Researched: 2026-06-10*
