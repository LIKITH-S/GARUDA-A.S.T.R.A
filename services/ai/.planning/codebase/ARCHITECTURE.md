# Architecture

**Analysis Date:** 2026-06-10

## Pattern Overview

**Overall:** Module-based AI Subsystem (Facial Recognition Service)

**Key Characteristics:**
- Stateless execution - Functions do not persist internal state; they process inputs and return outputs.
- Integrates directly as a dependency library inside the FastAPI backend.
- Single-responsibility core files - Dedicated modules for configuration, embedding generation, distance calculation, ranking, and evaluation.

## Layers

**API / Integration Boundary:**
- The AI subsystem is invoked by the FastAPI route `services/backend/api/v1/endpoints/ai_events.py`.
- It processes the uploaded image bytes and compares them against the PostgreSQL-stored missing person embeddings.

**Core AI Logic Layer:**
- `core/embedding_service.py` - Extracts the facial embedding from cropped face images.
- `core/similarity_service.py` - Calculates mathematical similarity between vectors.
- `core/ranking_service.py` - Orchestrates the database search by ranking database records against the query embedding.
- `core/evaluation_service.py` - Maps raw scores to qualitative confidence ratings.

**Model / Framework Layer:**
- `core/deepface_service.py` - Manages the configuration, backend settings, and loading of the underlying ArcFace model.

## Data Flow

**Facial Recognition Matching Flow:**

1. Edge camera (or mock engine) sends a `POST` request with image file to `/api/v1/ai-events/`.
2. Route handler reads image bytes and queries active missing persons with face embeddings from the DB.
3. Handler calls `core.embedding_service.generate_embedding(image_bytes)`:
   - Saves bytes to a temporary `.jpg` file.
   - Invokes `DeepFace.represent()` with ArcFace config.
   - Extracts and returns the 512-dim embedding.
   - Cleans up the temp file.
4. Route handler calls `core.ranking_service.get_best_match(target_embedding, database)`:
   - Loops over database records, calling `core.similarity_service.calculate_cosine_similarity()`.
   - Ranks matches in descending order of similarity.
   - If the best match exceeds the similarity threshold (default: 0.60), returns `(True, person_id, similarity)`.
5. Route handler saves the `DetectionEvent` and `Alert` to the DB and broadcasts webhooks to admin/dispatcher.

**State Management:**
- Stateless: The AI subsystem relies entirely on transient CPU/GPU memory during execution.
- Weights Cache: The DeepFace framework caches downloaded model weights in the user's home directory.

## Key Abstractions

**DeepFaceConfig:**
- Purpose: Centralizes model settings (ArcFace model, detector backend="skip", enforce detection=False) to ensure consistent model inference.
- Location: `core/deepface_service.py`

**Similarity Calculator:**
- Purpose: Wrapper around scipy's spatial distance calculation, mapping cosine distance to similarity (`1.0 - distance`).
- Location: `core/similarity_service.py`

## Entry Points

**Model Pre-loading:**
- Function: `initialize_deepface()` in `core/deepface_service.py`.
- Triggers: Called during backend server startup to load the heavy ArcFace weights into RAM early.

**Embedding Generation:**
- Function: `generate_embedding(image_bytes)` in `core/embedding_service.py`.
- Triggers: Called by route handler upon receiving a new detection frame.

**Ranking / Matching Engine:**
- Function: `get_best_match(target_embedding, database, threshold)` in `core/ranking_service.py`.
- Triggers: Called by route handler to search the candidate database for matches.

## Error Handling

**Strategy:**
- Fail-safe / Graceful Degradation: The AI service catches exceptions and returns `None` or default fallback scores (e.g. `0.0` similarity) rather than crashing the calling process.
- Detailed Logging: Errors (e.g. model inference failure, empty face detection) are logged using Python's standard `logging` library.

## Cross-Cutting Concerns

**Logging:**
- Standard library `logging` is configured per-module to track model initialization status and inference errors.

**Input Validation:**
- The FastAPI boundary validates image files before handing them down.
- The embedding service checks for empty results from DeepFace representation.

---

*Architecture analysis: 2026-06-10*
*Update when major patterns change*
