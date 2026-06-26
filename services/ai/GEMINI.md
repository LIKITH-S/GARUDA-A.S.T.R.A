<!-- GSD:project-start source:PROJECT.md -->
## Project

**Garuda A.S.T.R.A - AI Subsystem Split and Integration**

Garuda A.S.T.R.A is an AI-powered surveillance and tracking platform for missing person searches. The AI subsystem extracts facial embeddings from CCTV video inputs, compares them against a registry of missing persons, and triggers backend alerts on positive matches.

**Core Value:** Enable rapid, accurate identification of missing persons from video inputs through modular, high-performance face detection and recognition pipelines.

### Constraints

- **Dependency constraint**: We have completely migrated away from `RetinaFace` and `TensorFlow` for detection. The Detection Subsystem now exclusively uses `YOLOv8-face` via the `ultralytics` package for extreme speed and GPU support.
- **Optimization constraint**: Must support frame skipping and resolution resizing to handle heavy CCTV inputs without saturating server CPU resources.
- **Python Version**: Runs on Python 3.10+ (current system uses Python 3.13).
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- Python 3.10+ - All application logic, facial recognition core, embedding generation, and ranking services.
- None in the `services/ai` subsystem. (Note: Javascript/Shell are used in other monorepo areas).
## Runtime
- Python Runtime Environment
- System filesystem access required for temporary image file storage during model inference.
- pip - Managed via `services/requirements.txt`
- Virtual environment: `services/venv/` present in the services directory.
## Frameworks
- DeepFace (latest) - Wrapper framework for facial recognition and analysis.
- TensorFlow / Keras (via `tf-keras`) - Underneath runtime for running the ArcFace deep learning model.
- pytest (optional, configured via requirements / standard library testing tools).
- pip and standard python virtual environment tools.
## Key Dependencies
- `deepface` - High-level facial recognition library used for model building and embedding representation.
- `scipy` - Used for computing spatial distances (`scipy.spatial.distance.cosine`) between embeddings.
- `tf-keras` - TensorFlow Keras integration needed for ArcFace model loading and execution.
- `opencv-python-headless` - OpenCV package for image manipulation without GUI dependencies (headless environment).
- `tempfile` / `os` (Python Standard Library) - Used to create temporary JPG files to feed into the DeepFace API.
## Configuration
- Loaded configuration is managed via Python classes (`DeepFaceConfig` in `services/ai/core/deepface_service.py`).
- Model name: ArcFace (512-dimensional embedding).
- Detector backend: "skip" (assumes cropped face is received).
- Enforce detection: False.
- None needed (Python compiled on execution).
## Platform Requirements
- Cross-platform (Windows, macOS, Linux). Current developer OS is Windows.
- Python 3.10+ installed.
- Deployment target: Runs as an integrated module within the FastAPI backend process (uvicorn server).
- Relies on local CPU/GPU for DeepFace model inference.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Snake-case for all Python module files (`deepface_service.py`, `embedding_service.py`).
- Uppercase `.md` for documentation (`README.md`, `STACK.md`).
- Snake_case for all functions (`initialize_deepface()`, `generate_embedding()`, `calculate_cosine_similarity()`).
- Descriptive names indicating the operation (e.g. `get_best_match` or `evaluate_confidence`).
- Snake_case for local variables and parameters (`image_bytes`, `temp_path`, `similarity_score`, `target_embedding`).
- UPPER_SNAKE_CASE for class-level configuration constants (`MODEL_NAME`, `DETECTOR_BACKEND`, `ENFORCE_DETECTION`).
- PascalCase for class names (`DeepFaceConfig`).
- No private member prefixing (standard Python namespaces).
## Code Style
- Indentation: 4 spaces (standard PEP 8).
- Line length: Max 88-100 characters.
- String quotes: Double quotes for docstrings and most string literals; single quotes for keys/indices/short values (e.g. `wb`, `.jpg`, `model_name`).
- Function signatures should be explicitly typed (e.g., `image_bytes: bytes` and returns `Optional[List[float]]`).
- Import typing helpers (`from typing import List, Optional, Tuple, Dict`).
## Import Organization
- Keep standard library, third-party, and internal imports in separate blocks separated by a single blank line.
## Error Handling
- Try-except blocks wrapping external framework dependencies (like DeepFace representations or scipy calculations) that may raise transient exceptions.
- Exceptions should be caught, logged, and return a safe fallback value (`None`, `0.0`, or `(False, None, None)`) to prevent crashing the calling backend API.
- Filesystem resource cleanup must be guaranteed using `try...finally` structures (e.g. deleting temporary image files).
## Logging
- Standard Python `logging` library.
- Initialized per-module: `logger = logging.getLogger(__name__)`.
- Log info-level messages for setup and initialization: `logger.info("Initializing DeepFace model...")`.
- Log error-level messages with exception details: `logger.error(f"Error during embedding generation: {e}")`.
## Comments
- Triple-quote docstrings are required for all public-facing functions and classes.
- Describe the purpose, parameters (`Args:`), and return types (`Returns:`).
- Standard comment format: `# This is a placeholder for actual threshold tuning logic`.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Stateless execution - Functions do not persist internal state; they process inputs and return outputs.
- Integrates directly as a dependency library inside the FastAPI backend.
- Single-responsibility core files - Dedicated modules for configuration, embedding generation, distance calculation, ranking, and evaluation.
## Layers
- The AI subsystem is invoked by the FastAPI route `services/backend/api/v1/endpoints/ai_events.py`.
- It processes the uploaded image bytes and compares them against the PostgreSQL-stored missing person embeddings.
- `core/embedding_service.py` - Extracts the facial embedding from cropped face images.
- `core/similarity_service.py` - Calculates mathematical similarity between vectors.
- `core/ranking_service.py` - Orchestrates the database search by ranking database records against the query embedding.
- `core/evaluation_service.py` - Maps raw scores to qualitative confidence ratings.
- `core/deepface_service.py` - Manages the configuration, backend settings, and loading of the underlying ArcFace model.
## Data Flow
- Stateless: The AI subsystem relies entirely on transient CPU/GPU memory during execution.
- Weights Cache: The DeepFace framework caches downloaded model weights in the user's home directory.
## Key Abstractions
- Purpose: Centralizes model settings (ArcFace model, detector backend="skip", enforce detection=False) to ensure consistent model inference.
- Location: `core/deepface_service.py`
- Purpose: Wrapper around scipy's spatial distance calculation, mapping cosine distance to similarity (`1.0 - distance`).
- Location: `core/similarity_service.py`
## Entry Points
- Function: `initialize_deepface()` in `core/deepface_service.py`.
- Triggers: Called during backend server startup to load the heavy ArcFace weights into RAM early.
- Function: `generate_embedding(image_bytes)` in `core/embedding_service.py`.
- Triggers: Called by route handler upon receiving a new detection frame.
- Function: `get_best_match(target_embedding, database, threshold)` in `core/ranking_service.py`.
- Triggers: Called by route handler to search the candidate database for matches.
## Error Handling
- Fail-safe / Graceful Degradation: The AI service catches exceptions and returns `None` or default fallback scores (e.g. `0.0` similarity) rather than crashing the calling process.
- Detailed Logging: Errors (e.g. model inference failure, empty face detection) are logged using Python's standard `logging` library.
## Cross-Cutting Concerns
- Standard library `logging` is configured per-module to track model initialization status and inference errors.
- The FastAPI boundary validates image files before handing them down.
- The embedding service checks for empty results from DeepFace representation.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
