# Coding Conventions

**Analysis Date:** 2026-06-10

## Naming Patterns

**Files:**
- Snake-case for all Python module files (`deepface_service.py`, `embedding_service.py`).
- Uppercase `.md` for documentation (`README.md`, `STACK.md`).

**Functions:**
- Snake_case for all functions (`initialize_deepface()`, `generate_embedding()`, `calculate_cosine_similarity()`).
- Descriptive names indicating the operation (e.g. `get_best_match` or `evaluate_confidence`).

**Variables:**
- Snake_case for local variables and parameters (`image_bytes`, `temp_path`, `similarity_score`, `target_embedding`).
- UPPER_SNAKE_CASE for class-level configuration constants (`MODEL_NAME`, `DETECTOR_BACKEND`, `ENFORCE_DETECTION`).

**Classes:**
- PascalCase for class names (`DeepFaceConfig`).
- No private member prefixing (standard Python namespaces).

## Code Style

**Formatting:**
- Indentation: 4 spaces (standard PEP 8).
- Line length: Max 88-100 characters.
- String quotes: Double quotes for docstrings and most string literals; single quotes for keys/indices/short values (e.g. `wb`, `.jpg`, `model_name`).

**Type Hinting:**
- Function signatures should be explicitly typed (e.g., `image_bytes: bytes` and returns `Optional[List[float]]`).
- Import typing helpers (`from typing import List, Optional, Tuple, Dict`).

## Import Organization

**Order:**
1. Standard library imports (`import logging`, `import tempfile`, `import os`).
2. Third-party library imports (`from deepface import DeepFace`, `from scipy.spatial.distance import cosine`).
3. Local/internal imports (`from services.ai.core.deepface_service import DeepFaceConfig`).

**Grouping:**
- Keep standard library, third-party, and internal imports in separate blocks separated by a single blank line.

## Error Handling

**Patterns:**
- Try-except blocks wrapping external framework dependencies (like DeepFace representations or scipy calculations) that may raise transient exceptions.
- Exceptions should be caught, logged, and return a safe fallback value (`None`, `0.0`, or `(False, None, None)`) to prevent crashing the calling backend API.
- Filesystem resource cleanup must be guaranteed using `try...finally` structures (e.g. deleting temporary image files).

## Logging

**Framework:**
- Standard Python `logging` library.
- Initialized per-module: `logger = logging.getLogger(__name__)`.

**Patterns:**
- Log info-level messages for setup and initialization: `logger.info("Initializing DeepFace model...")`.
- Log error-level messages with exception details: `logger.error(f"Error during embedding generation: {e}")`.

## Comments

**JSDoc/TSDoc equivalent (Python Docstrings):**
- Triple-quote docstrings are required for all public-facing functions and classes.
- Describe the purpose, parameters (`Args:`), and return types (`Returns:`).

**TODO Comments:**
- Standard comment format: `# This is a placeholder for actual threshold tuning logic`.

---

*Convention analysis: 2026-06-10*
*Update when patterns change*
