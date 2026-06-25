# Roadmap: Garuda A.S.T.R.A - AI Subsystem Split and Integration

## Overview

This roadmap directs the split of the Garuda A.S.T.R.A AI tracking service into two decoupled subsystems (Detection and Recognition) and their subsequent integration via a unified video processing pipeline linked to the FastAPI backend API.

## Phases

- [x] **Phase 1: Recognition Subsystem Migration** - Move existing recognition core files to a new namespace package and resolve imports. (completed 2026-06-10)
- [ ] **Phase 2: Detection Subsystem Implementation** - Implement frame extraction, standalone RetinaFace detection, face cropping, and frame skipping optimizations.
- [ ] **Phase 3: Integration Pipelines** - Write shared pipeline wrappers linking detection crops to recognition vector matching.
- [ ] **Phase 4: Backend Integration & Verification** - Link the video pipeline to the FastAPI endpoints, database logs, and WebSockets.

## Phase Details

### Phase 1: Recognition Subsystem Migration
**Goal**: Decouple the recognition logic into a dedicated package.
**Depends on**: Nothing
**Requirements**: RECG-01, RECG-02, RECG-03, RECG-04
**Success Criteria**:
  1. Files migrated from `core/` to a new `recognition/` folder.
  2. All internal and external imports updated to use `services.ai.recognition`.
  3. Embedding and cosine similarity calculations run without exceptions.
**Plans**: 2 plans

Plans:
- [x] 01-01: Migrate files to `recognition/` package and clean up old `core/` files.
- [x] 01-02: Update imports across recognition modules and test namespace integrity.

---

### Phase 2: Detection Subsystem Implementation
**Goal**: Build the video frame extraction, RetinaFace detection, and face cropping pipeline.
**Depends on**: Phase 1
**Requirements**: DETC-01, DETC-02, DETC-03, DETC-04, DETC-05, DETC-06
**Success Criteria**:
  1. Ingests local `.mp4` video files and extracts frames.
  2. Frame skipping successfully drops N frames to save CPU resources.
  3. Standalone RetinaFace locates face bounding boxes inside the remaining frames.
  4. Crops bounding boxes and normalizes output face crops to 112x112 pixels.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Implement `video_service.py` and `frame_extractor.py` with frame skipping rules.
- [ ] 02-02: Implement `face_detection.py` utilizing standalone RetinaFace library, and `face_cropper.py`.
- [ ] 02-03: Implement `preprocessing.py` for cropping alignment and 112x112 resizing.

---

### Phase 3: Integration Pipelines
**Goal**: Write orchestrators connecting the detection crops directly to the recognition matching logic.
**Depends on**: Phase 2
**Requirements**: PIPE-01
**Success Criteria**:
  1. Unified `ai_pipeline.py` executes detection and recognition pipelines sequentially.
  2. Accepts video paths and returns structured candidate match logs.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement `detection_pipeline.py` and `recognition_pipeline.py` connectors.
- [ ] 03-02: Implement unified `ai_pipeline.py` wrapper.

---

### Phase 4: Backend Integration & Verification
**Goal**: Link the video pipeline to the FastAPI router, DB models, and WebSockets.
**Depends on**: Phase 3
**Requirements**: BEND-01, BEND-02
**Success Criteria**:
  1. FastAPI `POST /api/v1/ai-events/` accepts video files and triggers the unified pipeline.
  2. Detected matches log `DetectionEvent` and `Alert` records to the database.
  3. WebSocket manager broadcasts alerts to admin and dispatcher roles.
  4. End-to-end mock engine test runs successfully with matching alerts.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Modify FastAPI endpoint to ingest videos and call the AI pipeline.
- [ ] 04-02: Implement database log insertions and WebSocket alerts dispatch.
- [ ] 04-03: Run end-to-end integration tests with sample video files.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Recognition Subsystem Migration | 2/2 | Complete   | 2026-06-10 |
| 2. Detection Subsystem Implementation | 0/3 | Not started | - |
| 3. Integration Pipelines | 0/2 | Not started | - |
| 4. Backend Integration & Verification | 0/3 | Not started | - |
