# Feature Research

**Domain:** Computer Vision / CCTV Missing Persons Search
**Researched:** 2026-06-10
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Video File Ingestion | Operator uploads a surveillance clip for analysis. | LOW | Uses OpenCV `VideoCapture` to read frames. |
| Face Detection (RetinaFace) | System finds faces in the video frames. | MEDIUM | Standard face localizer. Standalone RetinaFace provides coordinates. |
| Face Cropping | Crop detected faces into separate sub-images. | LOW | Slice NumPy arrays using bounding boxes. |
| ArcFace Embeddings | Produce vector coordinates for cropped face images. | MEDIUM | Calls DeepFace ArcFace representation. |
| Cosine Match Ranking | Match target face against database records. | LOW | Computes cosine similarity and sorts. |
| Confidence Level Qualifying | Map numeric scores to human-understandable tiers. | LOW | High/Medium/Low thresholds. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Frame Skipping Optimization | Saves CPU/GPU by only processing every Nth frame (CCTV frame rates are redundant). | LOW | Read frame, skip next N frames, seek to next. |
| Downscale Resizing | Drastically speeds up RetinaFace execution by downscaling high-res (e.g. 4K/1080p) frames. | LOW | Rescale to e.g. 640x360 before face detection. |
| Standalone Subsystems | Clean split between Detection (Person 1) and Recognition (Person 2) allows independent development and updates. | MEDIUM | Separation into `detection/` and `recognition/` modules. |
| Unified Pipeline Runner | An end-to-end wrapper executing the detection pipeline, passing crops to the recognition pipeline, and returning alert triggers. | MEDIUM | Implemented in `pipeline/ai_pipeline.py`. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Live RTSP Stream Player | Operators want to watch the raw video inside the Python process. | GUI blocking, thread synchronization issues, memory leaks in OpenCV. | Process frames in a stateless background worker and broadcast alerts/clips via WebSockets. |
| Real-time 4K Face Detection | Operators want 4K frame resolution face searches. | RetinaFace is slow on high resolution. CPU usage spikes, system locks. | Rescale high-res feeds to standard 640x360 or 720p for detection, crop from original if high-res details are needed. |

## Feature Dependencies

```
[Video Ingestion]
       └──requires──> [Frame Extraction]
                            └──requires──> [Face Detection (RetinaFace)]
                                                 └──requires──> [Face Cropping]
                                                                      └──requires──> [ArcFace Embeddings]
                                                                                           └──requires──> [Match Ranking]
```

### Dependency Notes

- **Face Detection requires Frame Extraction:** Face detection models only work on static 2D image matrices.
- **ArcFace Embeddings requires Face Cropping:** ArcFace requires cropped, centered face inputs of size 112x112 for optimal similarity matching.

## MVP Definition

### Launch With (v1)

- [ ] Split structure (`detection/` and `recognition/` directories).
- [ ] OpenCV video reader with frame skipping (process every Nth frame).
- [ ] Resolution downscaling wrapper for face detection.
- [ ] Standalone RetinaFace detector and cropping.
- [ ] Relocated ArcFace embeddings, ranking, and similarity modules.
- [ ] Shared pipelines (`detection_pipeline.py`, `recognition_pipeline.py`, `ai_pipeline.py`).
- [ ] Integration with FastAPI backend API endpoints.

### Add After Validation (v1.x)

- [ ] Live RTSP/CCTV stream connection support (reconnecting socket logic).
- [ ] Multi-thread frame decoding (process frames in a separate thread).

### Future Consideration (v2+)

- [ ] PostgreSQL PGVector query integration (replaces memory ranking).
- [ ] CUDA GPU acceleration configuration.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Modular Subsystems Split | HIGH | LOW | P1 |
| Video File Frame Extractor | HIGH | LOW | P1 |
| RetinaFace Standalone Detection | HIGH | MEDIUM | P1 |
| Resolution Resizing/Frame Skipping | HIGH | LOW | P1 |
| Cosine Matching & Ranking | HIGH | LOW | P1 |
| Pipeline Integration Wrapper | HIGH | MEDIUM | P1 |

---
*Feature research for: Computer Vision / CCTV Missing Persons Search*
*Researched: 2026-06-10*
