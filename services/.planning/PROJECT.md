# GARUDA A.S.T.R.A

## What This Is

GARUDA A.S.T.R.A (AI-Powered Surveillance, Tactical Response & Alerting) is an AI-first public safety surveillance and smart dispatch platform. It ingests live camera feeds, runs face detection and recognition pipelines, generates real-time alerts when missing persons or persons of interest are identified, and orchestrates patrol unit dispatch through a control room dashboard and officer mobile application. The platform is designed for Indian metropolitan police and municipal safety operations.

## Core Value

When a missing child walks past any networked camera, the system must detect them, alert the control room, and dispatch the nearest patrol unit — autonomously, in real time. Everything else exists to make that loop reliable.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Next.js web dashboard with command overview, alerts, missing persons, patrol, response board, logs, uploads, and system admin pages — existing
- ✓ React Native mobile app with login, alerts, alert details, cases, logs, map, and profile screens — existing
- ✓ Monorepo structure (apps/, services/, database/, shared/, docs/) — existing

### Active

<!-- Current scope. Building toward these. -->

**Backend Core**
- [ ] FastAPI async backend with modular service architecture
- [ ] PostgreSQL database with normalized schema (16+ entities)
- [ ] SQLAlchemy ORM models with Alembic migrations
- [ ] JWT authentication with refresh tokens and role-based access (Admin, Control Room Operator, Patrol Officer)
- [ ] Middleware-based authorization and route protection
- [ ] Centralized error handling and structured logging
- [ ] Environment-based configuration management

**Operational Workflows**
- [ ] Incident management (create, update, close, timelines, evidence linking)
- [ ] Missing person reports (create, update, image upload, case officer assignment, status tracking)
- [ ] Alert management (create, real-time updates, acknowledge, review, history)
- [ ] Officer/patrol unit assignment system (assign, track status, update logs)
- [ ] Notification system (real-time push, alert notifications, operational updates)
- [ ] Activity/audit logging for all operations
- [ ] Evidence file management and linking

**Real-Time System**
- [ ] FastAPI WebSocket server for real-time alert broadcasting
- [ ] Dashboard live update feed (incidents, alerts, system status)
- [ ] Mobile app real-time synchronization
- [ ] AI status broadcasting (online/offline/degraded)

**AI Event Ingestion**
- [ ] Dedicated AI event ingestion API endpoint
- [ ] Event validation, storage, and alert generation pipeline
- [ ] WebSocket broadcast on AI detection events
- [ ] Automatic incident creation from high-confidence detections

**Mock AI Engine**
- [ ] Mock AI event generator simulating camera detections
- [ ] Simulated face recognition matches with confidence scores
- [ ] Simulated missing person identification events
- [ ] Behavior identical to future real AI engine contract

**Fault Tolerance**
- [ ] Graceful degradation when AI engine is offline
- [ ] Async task isolation with exception boundaries
- [ ] AI health monitoring and offline status reporting
- [ ] All operational APIs remain functional during AI failure

**Frontend Integration**
- [ ] Replace all hardcoded mock data in web dashboard with live API calls
- [ ] Replace all hardcoded mock data in mobile app with live API calls
- [ ] Wire all buttons, forms, and workflows to backend endpoints
- [ ] WebSocket integration for real-time dashboard updates
- [ ] WebSocket integration for real-time mobile updates

**System Health**
- [ ] Backend health check endpoints
- [ ] AI engine health check endpoints
- [ ] Database connectivity monitoring
- [ ] System uptime tracking
- [ ] Dashboard status display (AI/Backend/DB online/offline)

**API Standards**
- [ ] RESTful conventions across all endpoints
- [ ] Pagination, filtering, and sorting on all list endpoints
- [ ] Consistent response envelope format
- [ ] OpenAPI/Swagger auto-documentation

### Out of Scope

- Real AI model training and deployment — deferred to future milestone after backend is stable
- Real camera RTSP/HLS stream ingestion — requires AI engine implementation first
- Real face embedding generation (ArcFace/FAISS) — AI engine milestone
- Real-time video processing (OpenCV/YOLO pipeline) — AI engine milestone
- Multi-tenancy / multi-city deployment — future scaling concern
- Payment/billing systems — not applicable to this domain
- Public-facing citizen portal — operational tool only, not public-facing
- SSO/OAuth integration — JWT-only for v1
- Kubernetes/Docker orchestration — deploy concern, not build concern

## Context

**Existing Frontends (hardcoded mock data, no backend):**

Web dashboard pages:
- `/` — Command Overview (stat cards, latest match card, system activity feed, patrol unit status)
- `/alerts` — Live Alerts grid (6 hardcoded alerts with confidence scores, confirm/dismiss actions)
- `/missing` — Missing Persons Registry (6 hardcoded person cards, search, filters, AI match search button)
- `/patrol` — Patrol Unit Management (6 hardcoded units with battery/ping/health telemetry)
- `/status` — Response Board (Kanban-style: Standby → En Route → On Site columns)
- `/logs` — Activity/System Logs
- `/uploads` — Evidence/File Uploads
- `/system/services` — System Services Status
- `/system/settings` — System Settings
- `/system/users` — User Management

Mobile app screens:
- LoginScreen — officer authentication
- AlertsScreen — real-time alert list
- AlertDetailsScreen — individual alert with actions
- CasesScreen — missing person cases
- LogsScreen — activity logs
- MapScreen — geographic patrol view
- ProfileScreen — officer profile

**All data is hardcoded inline** — no API calls, no state management, no WebSocket connections. Every array is a `const` with fake data at the top of each file.

**Tech ecosystem:** The frontends use Next.js 15 + Tailwind CSS (web) and React Native + Expo (mobile). Backend will use FastAPI + SQLAlchemy + PostgreSQL. Services communicate via REST + WebSocket. AI engine will use a separate FastAPI service.

## Constraints

- **Tech stack**: FastAPI (Python) for backend and AI engine — established by project architecture
- **Database**: PostgreSQL — required for relational integrity across incidents, alerts, officers, detections
- **Service boundary**: backend-api and ai-engine must remain logically isolated services communicating via HTTP/events
- **Fault isolation**: AI engine failure must never crash operational backend — hard architectural requirement
- **Auth**: JWT with refresh tokens — no external auth provider for v1
- **Deployment target**: Single-server development initially, designed for horizontal scaling later

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| FastAPI over Django/Express | Async-native, Python ecosystem matches AI engine, auto-OpenAPI docs | — Pending |
| PostgreSQL over MongoDB | Relational integrity critical for incidents/alerts/officers/assignments; JSON columns available when needed | — Pending |
| Separate backend-api and ai-engine services | AI failures must not cascade to operational platform; independent scaling; different deployment lifecycles | — Pending |
| Mock AI engine before real AI | Validate entire alert→dispatch pipeline without waiting for ML models; frontend integration unblocked | — Pending |
| JWT auth (no OAuth/SSO) | Simpler for v1 internal tool; three fixed roles sufficient for operational use | — Pending |
| WebSocket for real-time (not SSE/polling) | Bidirectional communication needed for dispatch acknowledgements; lower latency for critical alerts | — Pending |

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
*Last updated: 2026-05-31 after initialization*
