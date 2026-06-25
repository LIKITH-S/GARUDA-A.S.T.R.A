# Project Research Summary

**Project:** Garuda A.S.T.R.A - AI Subsystem Split and Integration
**Domain:** Computer Vision / CCTV Facial Recognition
**Researched:** 2026-06-10
**Confidence:** HIGH

## Executive Summary

The Garuda A.S.T.R.A platform utilizes facial recognition on surveillance feeds to identify missing individuals. To optimize development velocity and keep structural changes modular, the AI processing system is split into two independent subsystems: a Face Detection Pipeline (Person 1) and a Face Recognition Pipeline (Person 2), which are integrated through shared pipeline classes.

Face detection will be powered by a standalone `retina-face` implementation to localize, crop, and preprocess faces from CCTV video feeds. Recognition will use standard `deepface` wrappers loaded with ArcFace weights, calculating cosine similarity distances against candidate vectors. Optimizations like frame skipping and resolution downscaling will be implemented to ensure the pipeline runs efficiently on standard server CPU resources.

Key risks include memory leaks when handling large video files, API blocking due to late model loading, and high false-positive matching rates under low similarity thresholds. These risks will be addressed by implementing frame-by-frame generator streams, pre-loading model weights on application startup, and setting strict similarity boundaries (High: >=0.85, Medium: >=0.70, default threshold: 0.60).

## Key Findings

### Recommended Stack

Python 3.10+ serves as the primary runtime language. Model execution relies on TensorFlow/Keras (via `tf-keras` package to compatibility with TensorFlow 2.16+). OpenCV Headless (`opencv-python-headless`) is recommended for headless frame decoding, slicing, and scaling. Standalone `retina-face` and standard `deepface` (ArcFace model) are the primary vision libraries, while `scipy` is used for mathematical distance calculations.

### Expected Features

- **Table Stakes:** Video ingestion and decoding, standalone face detection (RetinaFace), cropping and preprocessing face images (resizing to 112x112), embedding generation (ArcFace), cosine distance calculation, and match ranking.
- **Differentiators:** Frame-skipping optimizations (e.g. process every 15th frame), frame downscaling, modular folder structure separation, and unified pipeline wrappers.
- **Defer (v2+):** Parallel multi-camera stream rendering, GPU-accelerated Docker builds, and native DB-level pgvector indexing.

### Architecture Approach

The architecture is built on the Pipes and Filters pattern. The system consists of:
1. `detection/` - Handles video ingestion, frame extraction, face detection, cropping, and preprocessing.
2. `recognition/` - Generates embeddings, computes similarity, and ranks matches.
3. `pipeline/` - Orchestrates the sub-pipelines into a unified workflow (Video → Alert).

### Critical Pitfalls

1. **Video File Lock / Memory Bloat** — Prevent by using generator loops and releasing VideoCapture contexts in `finally` blocks.
2. **API Request Blocking** — Prevent by pre-loading heavy deep learning weights on backend server startup.
3. **High False-Positive Matches** — Mitigate by using a strict default threshold boundary (0.60).

## Implications for Roadmap

Based on research, the suggested phase structure for implementation is:

### Phase 1: Recognition Pipeline Migration
- **Rationale:** Move existing functional components into the new package structure first to establish the baseline recognition system.
- **Delivers:** Relocated files inside `recognition/` with proper imports and unit/integration baseline tests.

### Phase 2: Detection Pipeline Implementation
- **Rationale:** Build the face detection and cropping components independently.
- **Delivers:** Ingestion scripts, standalone RetinaFace detection, face cropping, preprocessing, and CCTV optimizations (skipping/resizing).

### Phase 3: Integration Pipelines
- **Rationale:** Connect the detection outputs (crops) to the recognition inputs (candidate database search).
- **Delivers:** Shared pipelines (`detection_pipeline.py`, `recognition_pipeline.py`, `ai_pipeline.py`) running end-to-end.

### Phase 4: Backend Integration & Verification
- **Rationale:** Replace the backend endpoint's old single-image search logic with the new video pipeline.
- **Delivers:** Live API endpoints ingesting video files, matching missing persons, and dispatching alert payloads.

---
*Research completed: 2026-06-10*
*Ready for roadmap: yes*
