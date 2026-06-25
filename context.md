# GARUDA A.S.T.R.A - Project Context & Implementation Guide

Welcome to **GARUDA A.S.T.R.A** (AI-Powered Surveillance, Tactical Response & Alerting). This document serves as a comprehensive onboarding guide and architectural overview for frontend engineers joining the project.

## 1. What This Is
GARUDA A.S.T.R.A is an AI-first public safety surveillance and smart dispatch platform. It ingests live camera feeds, runs face detection and recognition, generates real-time alerts when missing persons are identified, and orchestrates patrol unit dispatch through a Next.js web dashboard and a React Native mobile application. 

**Core Loop:** A missing person walks past a camera -> AI detects the face -> Backend generates a real-time alert -> WebSocket broadcasts to the Control Room Dashboard -> Dispatcher assigns a Patrol Unit.

---

## 2. The 7-Phase Implementation Roadmap
We broke the backend and AI implementation down into 7 phases to ensure logical, isolated development. Here is what each phase entails, and what it means for frontend integration:

### Phase 1: Database Foundation & Project Scaffolding
- **What we did:** Set up the FastAPI backend, PostgreSQL database, SQLAlchemy ORM models, and Alembic migrations. This forms the data layer (Users, Officers, Incidents, Alerts, etc.).
- **Frontend Impact:** No direct UI changes, but establishes the data models that all JSON responses will follow.

### Phase 2: Authentication & Core Operational APIs
- **What we did:** Implemented JWT-based Authentication, Role-based access, and all Core CRUD APIs (Incidents, Alerts, Missing Persons, Officers, Assignments).
- **Frontend Impact:** All frontend REST calls must include a Bearer JWT Token in the headers. You will be integrating against these pagination, filtering, and sorting-enabled endpoints rather than using hardcoded data.

### Phase 3: Real-Time WebSocket System
- **What we did:** Built a FastAPI WebSocket server with connection management, heartbeats, and topic-based broadcasting.
- **Frontend Impact:** The Next.js dashboard and React Native app need to establish a WebSocket connection authenticated via JWT. Alerts, incident updates, and assignment status changes will be pushed over this socket in real time.

### Phase 4: AI Event Pipeline & Mock Engine
- **What we did:** Implemented the AI ingestion endpoints and built mock engines to simulate detections so the frontend can be tested without needing a live camera feed. (Note: The real AI models and face embedding pipelines are out of scope for the current frontend integration phase).
- **Frontend Impact:** The dashboard will receive high-confidence detection events automatically. The missing persons page will include functionalities to search for matches powered by the AI engine.

### Phase 5: Notifications, Evidence & Activity Logging
- **What we did:** Added evidence file upload management, activity logging for all CRUD operations, and real-time notification generation.
- **Frontend Impact:** You will build UI components for uploading files (images of missing persons or incident evidence) and displaying activity/audit logs in the dashboard.

### Phase 6: Frontend & Mobile Integration
- **What this is:** This is the primary frontend phase. The goal is to replace all hardcoded mock data in the Next.js web dashboard and React Native mobile app with live API calls.
- **Frontend Impact:** You will wire all buttons, forms, and tables to the backend endpoints built in Phases 1-5, and connect the WebSocket for live updates.

### Phase 7: System Health, Polish & Production Hardening
- **What this is:** Adding health checks, ensuring API documentation (Swagger/OpenAPI) is accurate, and validating the system degrades gracefully if the AI engine goes offline.
- **Frontend Impact:** Displaying system health statuses (AI Online/Offline, DB Connected) visually on the dashboard settings/health page.

---

## 3. What We Have Done So Far
Currently, we have made significant progress laying down the backend foundations:
- **Project Structure**: Organized into `backend/`, `ai/`, and the existing frontend apps.
- **Phase 1, 2, & 3 Base**: We have scaffolded the database, configured JWT Auth, and stood up the WebSocket infrastructure.
- **Environment**: A unified `requirements.txt` has been created to easily spin up a Python 3.12 virtual environment locally for development.

## 4. Notes for the Frontend Engineer
- **API Documentation**: Once you run the backend using `uvicorn services.backend.main:app --reload`, you can access the interactive Swagger UI at `http://127.0.0.1:8000/docs`. This will be your primary source of truth for request/response payloads.
- **Mock Data**: The frontend currently relies entirely on `const` arrays hardcoded at the top of the files. Your main task during **Phase 6** will be to strip these out, replace them with React state (e.g., using React Query, SWR, or standard `useEffect`), and populate them with the live FastAPI backend.
- **WebSockets**: We use standard WebSockets (not SSE or polling) to ensure low latency. Make sure your frontend WebSocket client handles auto-reconnection and authentication gracefully.

If you have any questions about the data shapes, always check the `/docs` endpoint or reference the FastAPI schemas located in `services/backend/schemas/`.
