# Phase 2: Detection Subsystem Implementation - Context

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the video frame extraction, RetinaFace detection, and face cropping pipeline. Ingest local `.mp4` video files, apply frame skipping optimizations, detect face bounding boxes using a standalone RetinaFace library, and output normalized 112x112 pixel face crops.

</domain>

<decisions>
## Implementation Decisions

### Frame Skipping & Optimization
- **D-01:** Frame skipping interval must be a configurable parameter, defaulting to 5 (i.e., process every 5th frame, which corresponds to 6 fps for a standard 30 fps video).
- **D-02:** Resolution downscaling will not be applied; frames will be processed at their original resolution before face detection.

### RetinaFace Detection Threshold
- **D-03:** The confidence threshold for face detection must be a configurable parameter, defaulting to 0.8 (providing better recall for far away or partially turned faces compared to the standard 0.9 default).

### Face Preprocessing & Alignment
- **D-04:** Preprocessing will utilize RetinaFace's built-in face alignment (`align=True` in `extract_faces`).
- **D-05:** Output face crop frames must be resized to exactly 112x112 pixels to match the input requirements of the ArcFace recognition model.

### the agent's Discretion
- Bounding box crop expansion parameter settings.
- Logger formatting and module-level try-except error catching structures to prevent video ingestion pipeline crashes on corrupt frames.
- Temporary file directories for temporary images used during intermediate pipeline steps.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definitions & Constraints
- `services/ai/GEMINI.md` — Standalone RetinaFace library constraint, Python 3.10+ requirement, optimization constraints.
- `.planning/PROJECT.md` — Project architecture split and key decisions.
- `.planning/REQUIREMENTS.md` — Traceability matrix and DETC-01 to DETC-06 requirement specifications.

</canonical_refs>

<specifics>
## Specific Ideas

- Focus on local `.mp4` file processing as the primary entry point to keep the ingestion architecture clean for future live RTSP additions.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `services/ai/recognition/deepface_service.py` — Centralized configuration design pattern to adapt for the detection parameters.

### Integration Points
- `services/ai/detection/` (to be created) modules will feed crops directly into `services/ai/recognition/` modules via pipeline connectors.

</code_context>

<deferred>
## Deferred Ideas

- Live RTSP stream ingestion and reconnection logic — Deferred to Phase 4 (BEND-04).
- Multi-camera parallel stream dashboard — Out of scope.

</deferred>

---

*Phase: 02-detection-subsystem-implementation*
*Context gathered: 2026-06-11*
