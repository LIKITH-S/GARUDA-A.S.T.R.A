# External Integrations

**Analysis Date:** 2026-06-10

## APIs & External Services

**Facial Recognition Model Downloads:**
- DeepFace / Keras Weights - On the first call to `initialize_deepface()` or first embedding generation, DeepFace fetches pre-trained weight files for the `ArcFace` model from public download servers (typically Google Drive, GitHub Releases, or gdrive-proxies managed by deepface).
  - SDK/Client: `deepface` library.
  - Caching: Downloaded weights are stored locally in the user's home folder under `~/.deepface/weights/` to avoid network requests on subsequent starts.

## Data Storage

**Databases (Indirect):**
- PostgreSQL (via SQLAlchemy in FastAPI Backend) - The AI services do not query the DB directly, but are integrated with data models:
  - `MissingPerson` (table `missing_persons`): Contains `face_embedding` stored as JSON array of 512 floats.
  - `DetectionEvent` (table `detection_events`): Records successful matches, specifying `person_id` and `confidence_score`.
  - `Alert` (table `alerts`): Created when a match is found to notify operators.
  - Connection/Migrations: Handled by the FastAPI backend service using SQLAlchemy and Alembic.

**File Storage (Local Temporary):**
- Local Filesystem Temp Directory - Used to write raw uploaded image bytes into a temporary `.jpg` file via `tempfile.mkstemp()`.
  - Clean up: The temporary file is deleted in a `finally` block in `generate_embedding()` to prevent disk space leaks.

## Webhooks & Callbacks (Indirect)

**WebSocket Broadcasting:**
- When a facial recognition match is successfully registered, the backend broadcasts a `possible_match_detected` event via the WebSocket connection manager.
  - Audience: `admin` and `dispatcher` client roles.
  - Payload: Contains `alert_id`, `missing_person_id`, `camera_id`, `confidence`, and location coordinates (`lat`, `lng`).

## Environment Configuration

**Development:**
- Python Virtual Environment packages.
- No direct `.env` requirements for the `services/ai` logic, though the calling backend requires `DATABASE_URL` and other configs.

---

*Integration audit: 2026-06-10*
*Update when adding/removing external services*
