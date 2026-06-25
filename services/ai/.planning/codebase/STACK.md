# Technology Stack

**Analysis Date:** 2026-06-10

## Languages

**Primary:**
- Python 3.10+ - All application logic, facial recognition core, embedding generation, and ranking services.

**Secondary:**
- None in the `services/ai` subsystem. (Note: Javascript/Shell are used in other monorepo areas).

## Runtime

**Environment:**
- Python Runtime Environment
- System filesystem access required for temporary image file storage during model inference.

**Package Manager:**
- pip - Managed via `services/requirements.txt`
- Virtual environment: `services/venv/` present in the services directory.

## Frameworks

**Core:**
- DeepFace (latest) - Wrapper framework for facial recognition and analysis.
- TensorFlow / Keras (via `tf-keras`) - Underneath runtime for running the ArcFace deep learning model.

**Testing:**
- pytest (optional, configured via requirements / standard library testing tools).

**Build/Dev:**
- pip and standard python virtual environment tools.

## Key Dependencies

**Critical:**
- `deepface` - High-level facial recognition library used for model building and embedding representation.
- `scipy` - Used for computing spatial distances (`scipy.spatial.distance.cosine`) between embeddings.
- `tf-keras` - TensorFlow Keras integration needed for ArcFace model loading and execution.
- `opencv-python-headless` - OpenCV package for image manipulation without GUI dependencies (headless environment).

**Infrastructure:**
- `tempfile` / `os` (Python Standard Library) - Used to create temporary JPG files to feed into the DeepFace API.

## Configuration

**Environment:**
- Loaded configuration is managed via Python classes (`DeepFaceConfig` in `services/ai/core/deepface_service.py`).
- Model name: ArcFace (512-dimensional embedding).
- Detector backend: "skip" (assumes cropped face is received).
- Enforce detection: False.

**Build:**
- None needed (Python compiled on execution).

## Platform Requirements

**Development:**
- Cross-platform (Windows, macOS, Linux). Current developer OS is Windows.
- Python 3.10+ installed.

**Production:**
- Deployment target: Runs as an integrated module within the FastAPI backend process (uvicorn server).
- Relies on local CPU/GPU for DeepFace model inference.

---

*Stack analysis: 2026-06-10*
*Update after major dependency changes*
