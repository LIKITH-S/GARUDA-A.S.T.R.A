# Codebase Concerns

**Analysis Date:** 2026-06-10

## Tech Debt

**Disk I/O for Embedding Generation:**
- Issue: `generate_embedding` writes raw image bytes to a temporary disk file via `tempfile.mkstemp()` before passing the path to `DeepFace.represent`.
- File: `core/embedding_service.py` (lines ~22-51)
- Why: Simple way to feed image bytes to the DeepFace library API.
- Impact: Unnecessary disk write/read overhead for every detection request. Potential disk space leakage if file removal fails during unexpected exceptions.
- Fix approach: Load image bytes directly into a NumPy array using OpenCV (`cv2.imdecode`) and pass the memory array directly to `DeepFace.represent`, removing all disk I/O.

**Linear Embedding Search (O(N) Complexity):**
- Issue: Match ranking performs a full linear scan over all active database records in memory.
- File: `core/ranking_service.py` (lines ~10-39)
- Why: Simple prototype mapping.
- Impact: Scaling bottleneck. CPU usage and latency will grow linearly with the number of reported missing persons.
- Fix approach: Integrate a vector search extension (like `pgvector` for PostgreSQL) and delegate similarity search to the database level, utilizing indexing (e.g. HNSW or IVFFlat).

**Placeholder Threshold Tuning:**
- Issue: `tune_threshold` function is a placeholder returning a static value `0.60`.
- File: `core/evaluation_service.py` (lines ~22-30)
- Why: Deferred implementation.
- Impact: Unable to dynamically optimize thresholds based on true match/non-match evaluation datasets.
- Fix approach: Implement F1-score optimization calculations across a validation dataset.

## Known Bugs

- None currently identified in active operation, but the API endpoints lack validation against malformed or non-image payloads.

## Security Considerations

**Model Weights Integrity & Availability:**
- Risk: DeepFace downloads pre-trained model weights from third-party hosting providers (like Google Drive) at runtime.
- File: `core/deepface_service.py` (lines ~23-33)
- Current mitigation: None.
- Recommendations: Model weight files should be bundled in the deployment container or hosted in a secure, internal, version-controlled storage bucket (e.g., AWS S3, GCS) instead of relying on public web downloads.

## Performance Bottlenecks

**DeepFace Model Loading Latency:**
- Problem: The ArcFace model is heavy and takes several seconds to load into memory.
- File: `core/deepface_service.py` (lines ~23-33)
- Measurement: Can block startup for 5-15 seconds.
- Cause: Reading heavy TensorFlow weights into RAM/VRAM.
- Improvement path: Ensure `initialize_deepface()` is run asynchronously in a background startup task rather than blocking the main FastAPI thread startup.

## Scaling Limits

**CPU Inference capacity:**
- Current capacity: Sequential CPU-based DeepFace inference is limited to ~1-3 images per second.
- Limit: Edge cameras triggering multiple requests simultaneously will saturate CPU cores.
- Symptoms at limit: Latency spikes on POST `/api/v1/ai-events/`, HTTP 504 timeouts.
- Scaling path: Deploy the AI service on GPU-enabled instances or offload model inference to a dedicated microservice running Triton Inference Server.

## Test Coverage Gaps

**Core Algorithm Verification:**
- What's not tested: Embedding similarity math, ranking/sorting, and confidence qualifying.
- Risk: Regression in matching accuracy due to package updates (e.g., scipy or deepface version changes).
- Priority: High
- Difficulty to test: Low. Can easily be tested with mock vector arrays.

---

*Concerns audit: 2026-06-10*
*Update as issues are fixed or new ones discovered*
