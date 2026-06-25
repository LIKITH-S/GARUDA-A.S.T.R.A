# Garuda A.S.T.R.A - AI Subsystem Split and Integration

## What This Is

Garuda A.S.T.R.A is an AI-powered surveillance and tracking platform for missing person searches. The AI subsystem extracts facial embeddings from CCTV video inputs, compares them against a registry of missing persons, and triggers backend alerts on positive matches.

## Core Value

Enable rapid, accurate identification of missing persons from video inputs through modular, high-performance face detection and recognition pipelines.

## Requirements

### Validated

- ✓ ArcFace embedding generation (512-dimensional vector) from pre-cropped face images — Phase 0
- ✓ Cosine similarity calculation using SciPy spatial distance — Phase 0
- ✓ In-memory candidate search ranking and threshold-based matching (default: 0.60) — Phase 0
- ✓ Core confidence evaluation mapping to High/Medium/Low tiers — Phase 0
- ✓ Live match detection ingestion endpoint in FastAPI backend — Phase 0

### Active

- [ ] Move existing recognition logic from `core/` to `recognition/` package to align with the split architecture.
- [ ] Implement detection subsystem (`detection/`) with:
  - `video_service.py` - Ingests local video files (modular for future live streams).
  - `frame_extractor.py` - Extracts frames from ingested video.
  - `face_detection.py` - Standalone RetinaFace face detection.
  - `face_cropper.py` - Crops detected faces.
  - `preprocessing.py` - Image preprocessing for ArcFace alignment.
- [ ] Implement CCTV optimization in the detection pipeline:
  - Frame skipping (process every Nth frame).
  - Resolution resizing.
- [ ] Implement shared pipeline logic (`pipeline/`):
  - `detection_pipeline.py` - Integrates video ingestion to face crop output.
  - `recognition_pipeline.py` - Integrates face crop to match ranking.
  - `ai_pipeline.py` - End-to-end flow execution (CCTV Video → Alert).
- [ ] Integrate the unified AI pipeline with the backend API to replace the current single-image ingestion logic with full video/stream analysis capabilities.

### Out of Scope

- Live RTSP stream ingestion in v1 — Deferred; initial implementation focuses on local video file ingestion, keeping the architecture modular for RTSP later.
- Web GUI video stream rendering — Feeds are analyzed in the backend, and results are posted to API routes; raw video streaming to client is out of scope.

## Context

- The current repository contains the Recognition components in `services/ai/core/`.
- The backend API receives raw image files, generates embeddings, ranks them, and triggers alerts.
- Splitting the AI system into detection and recognition packages allows two developers (Person 1 and Person 2) to work independently on their respective pipelines before merging.

## Constraints

- **Dependency constraint**: Must use a standalone RetinaFace library (more flexible than built-in DeepFace detection backend).
- **Optimization constraint**: Must support frame skipping and resolution resizing to handle heavy CCTV inputs without saturating server CPU resources.
- **Python Version**: Runs on Python 3.10+ (current system uses Python 3.13).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Relocate `core/` to `recognition/` | Simplifies the architectural split and supports clean codebase division. | — Pending |
| Standalone RetinaFace library | Provides greater architectural flexibility and independence from DeepFace dependencies. | — Pending |
| Video file ingestion focus | Allows modular testing of the pipeline with local files before introducing RTSP streaming complexity. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-10 after project initialization*
