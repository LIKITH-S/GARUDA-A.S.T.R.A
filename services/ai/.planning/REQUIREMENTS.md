# Requirements: Garuda A.S.T.R.A - AI Subsystem Split and Integration

**Defined:** 2026-06-10
**Core Value:** Enable rapid, accurate identification of missing persons from video inputs through modular, high-performance face detection and recognition pipelines.

## v1 Requirements

### Detection Subsystem (DETC)

- [x] **DETC-01**: Ingest local video files (`.mp4`) as input to the AI pipeline.
- [x] **DETC-02**: Extract video frames from input files programmatically.
- [x] **DETC-03**: Detect faces in extracted frames using a standalone RetinaFace library.
- [x] **DETC-04**: Crop detected face bounding boxes into separate sub-images.
- [x] **DETC-05**: Preprocess crop frames (resize to 112x112 to match ArcFace requirements and normalize color channels).
- [x] **DETC-06**: Optimize detection via frame skipping (process every Nth frame to preserve CPU resources).

### Recognition Subsystem (RECG - Refactored/Existing)

- [x] **RECG-01**: Relocate existing recognition modules from `core/` to a new `recognition/` folder and update dependencies.
- [x] **RECG-02**: Preserve existing Keras-based ArcFace 512-dim embedding generation.
- [x] **RECG-03**: Preserve cosine similarity metric calculations and candidate matching.
- [x] **RECG-04**: Preserve qualitative match confidence level classification (High/Medium/Low).

### Pipeline (PIPE)

- [ ] **PIPE-01**: Implement the unified AI pipeline orchestrator that processes raw video and returns candidate matches.

### Backend Integration (BEND)

- [ ] **BEND-01**: Modify FastAPI route `POST /api/v1/ai-events/` to receive video files and call the unified AI pipeline.
- [ ] **BEND-02**: Broadcast match events with camera and alert IDs via the WebSocket connection manager to dispatcher/admin roles.

## v2 Requirements

### Optimizations & Streams

- **DETC-07**: Optimize detection via frame resolution downscaling (reducing pixels before calling RetinaFace).
- **BEND-03**: Pre-load Keras weights on FastAPI startup hook to prevent first-request request blocking.
- **BEND-04**: Support live RTSP CCTV camera stream ingestion and reconnection logic.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-camera parallel stream dashboard | Complex frontend rendering is out of scope for the AI backend subsystem. |
| In-browser live stream video decoding | Live feeds are decoded and analyzed on the backend only. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DETC-01 | Phase 2 | Complete |
| DETC-02 | Phase 2 | Complete |
| DETC-03 | Phase 2 | Complete |
| DETC-04 | Phase 2 | Complete |
| DETC-05 | Phase 2 | Complete |
| DETC-06 | Phase 2 | Complete |
| RECG-01 | Phase 1 | Complete |
| RECG-02 | Phase 1 | Complete |
| RECG-03 | Phase 1 | Complete |
| RECG-04 | Phase 1 | Complete |
| PIPE-01 | Phase 3 | Pending |
| BEND-01 | Phase 4 | Pending |
| BEND-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-10*
*Last updated: 2026-06-10 after initial definition*
