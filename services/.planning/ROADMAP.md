# Roadmap: GARUDA A.S.T.R.A

**Created:** 2026-05-31
**Milestone:** v1.0 — Production Backend Foundation
**Phases:** 7
**Granularity:** Standard

## Milestone: v1.0 — Production Backend Foundation

### Phase 1: Database Foundation & Project Scaffolding

**Goal:** Stand up the FastAPI project skeleton with all SQLAlchemy models, Alembic migrations, and async database infrastructure — the foundation everything else builds on.

**Requirements:** DBFN-01, DBFN-02, DBFN-03, DBFN-04, DBFN-05, DBFN-06, DBFN-07, APIS-04, APIS-05, APIS-07

**Success Criteria:**
1. FastAPI app starts and serves `/docs` with auto-generated OpenAPI
2. All 16+ SQLAlchemy models created with proper relationships and indexes
3. `alembic upgrade head` creates all tables in PostgreSQL
4. Seed script populates development data (users, officers, cameras, locations)
5. Consistent response envelope and error handling operational

**Depends on:** Nothing — foundational phase

**UI hint**: no

---

### Phase 2: Authentication & Core Operational APIs

**Goal:** Implement JWT auth system and all core CRUD APIs (incidents, alerts, missing persons, officers, assignments) so the platform has its operational backbone.

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, INCI-01, INCI-02, INCI-03, INCI-04, INCI-05, INCI-06, INCI-07, INCI-08, ALRT-02, ALRT-03, ALRT-04, ALRT-05, ALRT-07, MISS-01, MISS-02, MISS-03, MISS-04, MISS-05, MISS-06, OFCR-01, OFCR-02, OFCR-03, OFCR-04, OFCR-05, OFCR-06, APIS-01, APIS-02, APIS-03, APIS-06

**Success Criteria:**
1. User can register, login, receive JWT tokens, refresh tokens, and logout
2. Protected endpoints return 401/403 for unauthorized access
3. All incident CRUD works with status transition enforcement
4. All alert CRUD works with acknowledge/dismiss/resolve flow
5. Missing person CRUD works with image upload and case officer assignment
6. Officer CRUD and assignment tracking operational with status transitions
7. All list endpoints support pagination, filtering, and sorting

**Depends on:** Phase 1

**UI hint**: no

---

### Phase 3: Real-Time WebSocket System

**Goal:** Implement the WebSocket server with connection management, heartbeat, and topic-based broadcasting for alerts, incidents, assignments, and system status.

**Requirements:** RTWS-01, RTWS-02, RTWS-03, RTWS-04, RTWS-05, RTWS-06, RTWS-07, RTWS-08

**Success Criteria:**
1. WebSocket endpoint accepts JWT-authenticated connections
2. ConnectionManager tracks connections with topic-based channels
3. Alert creation in API triggers WebSocket broadcast to all connected clients within 1 second
4. Incident and assignment status changes broadcast to connected clients
5. Heartbeat mechanism detects and cleans stale connections (30s ping, 60s timeout)
6. Failed WebSocket sends remove connection gracefully without server crash

**Depends on:** Phase 2 (requires auth system for WS authentication, requires CRUD endpoints to generate events)

**UI hint**: no

---

### Phase 4: AI Event Pipeline & Mock Engine

**Goal:** Build the AI event ingestion endpoint, auto-alert generation, auto-incident creation, and a mock AI engine that simulates realistic detection events — validating the entire detection→alert→dispatch pipeline.

**Requirements:** ALRT-01, ALRT-06, MISS-07, AIEV-01, AIEV-02, AIEV-03, AIEV-04, AIEV-05, AIEV-06, MOCK-01, MOCK-02, MOCK-03, MOCK-04, MOCK-05, MOCK-06, HLTH-03, HLTH-05

**Success Criteria:**
1. POST /api/v1/ai-events accepts detection event payloads and stores them
2. Valid detection events auto-generate alert records
3. High-confidence detections auto-create incidents (configurable threshold)
4. Missing person match events auto-link to existing missing person cases
5. All detection events broadcast via WebSocket
6. Mock engine generates realistic events at configurable intervals
7. AI health check uses circuit breaker (3 failures → open, 30s reset)

**AI Pipeline Split (Orderly Implementation):**
* **Frontend (Next.js/React Native):** Handles Video Stream → OpenCV → RetinaFace → Face Crop → Send to Backend.
* **Backend (FastAPI):** Handles Face Crop → DeepFace → ArcFace Embedding → Cosine Similarity → Match Result → Alert Generation → PostgreSQL.

**Depends on:** Phase 3 (requires WebSocket for event broadcasting)

**UI hint**: no

---

### Phase 5: Notifications, Evidence & Activity Logging

**Goal:** Implement notification delivery, evidence file management, and comprehensive activity logging — the supporting systems that make the operational platform audit-ready.

**Requirements:** NOTF-01, NOTF-02, NOTF-03, NOTF-04, EVID-01, EVID-02, EVID-03, ACTV-01, ACTV-02, ACTV-03

**Success Criteria:**
1. Notifications generated for alerts, incident assignments, status changes, and AI health changes
2. Notifications delivered via WebSocket in real-time
3. User can view notification list with unread count and mark as read
4. Evidence files upload and serve through authenticated endpoints
5. All CRUD operations generate activity log entries
6. Activity log queryable with filtering and pagination

**Depends on:** Phase 3 (notifications require WebSocket), Phase 2 (evidence requires incident/missing person entities)

**UI hint**: no

---

### Phase 6: Frontend & Mobile Integration

**Goal:** Replace all hardcoded mock data in the Next.js web dashboard and React Native mobile app with real backend API calls and WebSocket connections.

**Requirements:** FINT-01, FINT-02, FINT-03, FINT-04, FINT-05, FINT-06, FINT-07, FINT-08, MINT-01, MINT-02, MINT-03, MINT-04, MINT-05, MINT-06, MINT-07

**Success Criteria:**
1. Dashboard Command Overview shows real stats, latest match, activity feed from backend
2. Dashboard Alerts page loads from API with real-time WebSocket updates
3. Dashboard Missing Persons page has working search, filters, and New Case form
4. Dashboard Patrol and Response Board show real officer/assignment data
5. Mobile login authenticates against backend
6. Mobile alerts load from backend with real-time updates
7. All buttons and forms on both apps submit to real backend endpoints

**Depends on:** Phase 5 (all backend APIs must be operational)

**UI hint**: yes

---

### Phase 7: System Health, Polish & Production Hardening

**Goal:** Add system health monitoring, finalize API documentation, security hardening, and validate end-to-end operational readiness.

**Requirements:** HLTH-01, HLTH-02, HLTH-04

**Success Criteria:**
1. Health endpoints operational: /health/live, /health/ready, /health/ai, /health/status
2. Dashboard system status page shows AI/Backend/DB health correctly
3. Stopping AI engine shows "AI Offline" in dashboard; all other features continue working
4. OpenAPI documentation complete and accurate for all endpoints
5. No password hashes, internal IDs, or sensitive data in any API response

**Depends on:** Phase 6

**UI hint**: no

---

## Coverage

**Total v1 requirements:** 82
**Mapped to phases:** 82
**Unmapped:** 0 ✓

### Phase Summary

| Phase | Name | Requirements | Count |
|-------|------|-------------|-------|
| 1 | Database Foundation & Project Scaffolding | DBFN-01–07, APIS-04,05,07 | 10 |
| 2 | Authentication & Core Operational APIs | AUTH-01–09, INCI-01–08, ALRT-02–05,07, MISS-01–06, OFCR-01–06, APIS-01–03,06 | 38 |
| 3 | Real-Time WebSocket System | RTWS-01–08 | 8 |
| 4 | AI Event Pipeline & Mock Engine | ALRT-01,06, MISS-07, AIEV-01–06, MOCK-01–06, HLTH-03,05 | 17 |
| 5 | Notifications, Evidence & Activity Logging | NOTF-01–04, EVID-01–03, ACTV-01–03 | 10 |
| 6 | Frontend & Mobile Integration | FINT-01–08, MINT-01–07 | 15 |
| 7 | System Health, Polish & Production Hardening | HLTH-01,02,04 | 3 |

---
*Roadmap created: 2026-05-31*
*Last updated: 2026-05-31 after initialization*
