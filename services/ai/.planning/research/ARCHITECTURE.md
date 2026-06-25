# Architecture Research

**Domain:** Computer Vision / Facial Tracking Subsystems
**Researched:** 2026-06-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                       │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   AI Event Route      │ ◄────►│   WebSocket Manager   │  │
│  └──────────┬────────────┘       └───────────▲───────────┘  │
│             │                                │              │
├─────────────┼────────────────────────────────┼──────────────┤
│             ▼                                │              │
│      ┌───────────────┐                       │              │
│      │  AI Pipeline  │                       │              │
│      └──────┬────────┘                       │              │
│             │ (calls)                        │              │
│  ┌──────────┴────────────┐       ┌───────────┴───────────┐  │
│  │  Detection Pipeline   ├──────►│  Recognition Pipeline │  │
│  │  (Ingest, Crop, Prep) │       │  (ArcFace, Cosine,    │  │
│  │                       │       │   Rank, Match)        │  │
│  └───────────────────────┘       └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `detection/` | Decodes video streams, extracts frames, detects face landmarks, crops face regions, and preprocesses inputs. | OpenCV + standalone `retina-face` library. |
| `recognition/` | Generates 512-dim facial vectors and compares them against PostgreSQL database records using cosine calculations. | DeepFace (ArcFace model weights) + SciPy. |
| `pipeline/` | Integrates the detection and recognition pipelines into a unified data flow, handling inputs and returning final match alerts. | Custom pipeline orchestrator wrapper. |

## Recommended Project Structure

```
services/ai/
├── detection/
│   ├── video_service.py       # Ingests video clips or files
│   ├── frame_extractor.py     # Extracts frames with skip limits
│   ├── face_detection.py      # Invokes RetinaFace models
│   ├── face_cropper.py        # Cuts face boxes from frames
│   └── preprocessing.py       # Standardizes crop dimensions to 112x112
├── recognition/
│   ├── deepface_service.py    # ArcFace model initialization
│   ├── embedding_service.py   # Generates 512-dim vectors
│   ├── similarity_service.py  # Cosine distance computation
│   ├── ranking_service.py     # Ranks candidates from database
│   └── evaluation_service.py  # Tiers match confidence levels
└── pipeline/
    ├── detection_pipeline.py  # Connects Video -> Crops
    ├── recognition_pipeline.py# Connects Crop -> Candidates
    └── ai_pipeline.py         # End-to-end flow runner
```

## Architectural Patterns

### Pattern 1: Pipes and Filters

The AI pipeline is structured as a series of computational filters where the output of the preceding stage becomes the input to the next.
- Video Ingestion filters frames based on skipping rules.
- Frame Extractor filters frames without faces.
- Face Detection outputs bounding boxes.
- Face Cropper outputs sub-images.
- Recognition generates vectors.
- Similarity computes matching metrics.

## Data Flow

### Match Ingestion Flow

```
[Local Video File] 
       ↓ (Ingested by video_service.py)
[Frames Matrix] 
       ↓ (Skipped & Resized by frame_extractor.py)
[Filtered Frames] 
       ↓ (Processed by face_detection.py)
[Bounding Boxes] 
       ↓ (Sliced by face_cropper.py)
[Preprocessed Crops (112x112)] 
       ↓ (Input to embedding_service.py)
[Target Embeddings] 
       ↓ (compared with database vectors via ranking_service.py)
[Match Scores (0.0 to 1.0)] 
       ↓ (evaluated via evaluation_service.py)
[Alert Trigger & Dispatch]
```

### Scaling Considerations

- **Frame skip rate**: For standard security video (30 FPS), adjacent frames are virtually identical. Processing every 10th or 15th frame (2-3 FPS) reduces computation by 90% while retaining high detection coverage.
- **Resolution scaling**: Running RetinaFace on 1080p is slow. Resizing frames to 640x360 reduces pixel volume by 89%, vastly speeding up detection.

## Sources

- *Architecture of Computer Vision Systems* (Pattern Reference).
- *DeepFace & RetinaFace performance scaling benchmarks*.

---
*Architecture research for: Computer Vision / Facial Tracking*
*Researched: 2026-06-10*
