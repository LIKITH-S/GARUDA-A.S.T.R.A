# Pitfalls Research

**Domain:** Computer Vision / CCTV Surveillance
**Researched:** 2026-06-10
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Video File Lock & Memory Bloat

**What goes wrong:**
Loading long video files using OpenCV `VideoCapture` without releasing resources or reading entire clips into RAM leads to system OOM (Out of Memory) crashes.

**Why it happens:**
Developers forget to call `cap.release()` or try to append every raw frame matrix (which are large) to a list.

**How to avoid:**
Process video streams frame-by-frame (generator pattern). Ensure resources are closed using `try...finally` or context managers.

**Warning signs:**
RAM usage grows continuously during a video processing run.

**Phase to address:**
Phase 2 (Detection pipeline implementation).

---

### Pitfall 2: High False-Positive Rate with low thresholds

**What goes wrong:**
The system generates too many false-positive matches (matching a camera frame to a completely different missing person).

**Why it happens:**
Setting the cosine similarity matching threshold too low (e.g. < 0.50). ArcFace is precise but requires a proper threshold boundary.

**How to avoid:**
Configure a strict default threshold (0.60 to 0.70) and classify matches above 0.85 as High confidence, above 0.70 as Medium, and anything below as Low/No Match.

**Warning signs:**
Mock engine logs constant matches for arbitrary random faces.

**Phase to address:**
Phase 1 (Recognition migration) & Phase 3 (Pipeline testing).

---

### Pitfall 3: Model Initialization Blocking API requests

**What goes wrong:**
The API server times out or takes 15 seconds to respond to the first API call.

**Why it happens:**
The ArcFace or RetinaFace models are lazy-loaded on the first request. The request thread is blocked while Keras builds the graph and downloads weights.

**How to avoid:**
Pre-load models on startup inside `initialize_deepface()` during the FastAPI initialization event lifecycle.

**Warning signs:**
The first matching request is extremely slow, but subsequent requests are fast.

**Phase to address:**
Phase 4 (Backend API integration).

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Static Thresholds | No need to calculate statistics or F1 scores. | Unoptimized matching accuracy across different camera qualities. | Acceptable in initial v1 setup. |
| In-memory linear matching scan | Easy implementation. | Inability to scale to large missing person registries (>10,000 active cases). | Acceptable for v1 local tests. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| PostgreSQL JSON storage | Storing embeddings as strings or parsing JSON on every row computation. | Let SQLAlchemy automatically map the column type as PostgreSQL `JSON` or `FLOAT[]` type. |
| Video file upload upload size limits | Uploading large gigabyte files to the FastAPI server blocks request loops. | Limit max file uploads or upload video segments/metadata. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No Frame Skipping | Very slow video analysis (e.g. 5 minutes to analyze a 1-minute clip). | Skip N frames (e.g. read 1 frame, skip 14, read next). | Processing high frame-rate clips (30+ FPS). |
| High-Resolution Detection | CPU cores hit 100%, frame rate drops to <1 FPS. | Downscale input frame to 640x360 before calling RetinaFace detector. | Full HD (1080p) or 4K input frames. |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Insecure Model Weight Source | Manually pulling weight binaries from unverified URLs at runtime. | Pack model weights in the docker image, verify checksum hashes, or download from secure cloud buckets. |

---
*Pitfalls research for: Computer Vision / CCTV Surveillance*
*Researched: 2026-06-10*
