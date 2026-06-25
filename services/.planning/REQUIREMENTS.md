# Requirements: GARUDA A.S.T.R.A

**Defined:** 2026-05-31
**Core Value:** When a missing child walks past any networked camera, the system must detect them, alert the control room, and dispatch the nearest patrol unit — autonomously, in real time.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Database & Foundation

- [ ] **DBFN-01**: Project scaffolded as FastAPI application with modular router/service/model architecture
- [ ] **DBFN-02**: PostgreSQL database with normalized schema covering all 16+ entities (Users, Roles, Officers, Incidents, Alerts, DetectionEvents, MissingPersons, Assignments, Notifications, ActivityLogs, EvidenceFiles, CameraFeeds, Locations, SystemStatus, IncidentUpdates, AIHealthStatus)
- [ ] **DBFN-03**: SQLAlchemy 2.0 async models with proper relationships, indexes, and constraints
- [ ] **DBFN-04**: Alembic migration system initialized with initial schema migration
- [ ] **DBFN-05**: Async database session management with connection pooling
- [ ] **DBFN-06**: Environment-based configuration using Pydantic BaseSettings (.env support)
- [ ] **DBFN-07**: Seed data script for development (sample users, officers, cameras, locations)

### Authentication & Security

- [ ] **AUTH-01**: User can register with email, password, full name, and assigned role
- [ ] **AUTH-02**: User can log in with email and password, receiving JWT access token and refresh token
- [ ] **AUTH-03**: Access tokens expire after 30 minutes; refresh tokens expire after 7 days
- [ ] **AUTH-04**: User can refresh access token using valid refresh token
- [ ] **AUTH-05**: User can log out, which revokes their refresh token
- [ ] **AUTH-06**: Role-based access control enforced: Admin, Control Room Operator, Patrol Officer
- [ ] **AUTH-07**: Protected routes return 401 for unauthenticated requests and 403 for insufficient role
- [ ] **AUTH-08**: Passwords hashed with bcrypt; password hashes never returned in API responses
- [ ] **AUTH-09**: All authentication events logged (login success, login failure, logout, token refresh)

### Incident Management

- [ ] **INCI-01**: Operator can create an incident with title, description, severity, location, and assigned camera
- [ ] **INCI-02**: Operator can update incident details (description, severity, location)
- [ ] **INCI-03**: Incident status transitions enforced: Open → In Progress → Resolved → Closed
- [ ] **INCI-04**: Operator can add timeline updates (text notes) to an incident
- [ ] **INCI-05**: Operator can link evidence files to an incident
- [ ] **INCI-06**: Operator can assign officers to an incident
- [ ] **INCI-07**: Operator can list incidents with filtering by status, severity, date range, and location
- [ ] **INCI-08**: Operator can view single incident with full timeline, assignments, and linked evidence

### Alert Management

- [ ] **ALRT-01**: System can create alerts from AI detection events with confidence score, camera, location, and snapshot reference
- [ ] **ALRT-02**: Operator can view list of alerts with filtering by status (Pending, Confirmed, Dismissed, Resolved), severity, and date range
- [ ] **ALRT-03**: Operator can acknowledge/confirm an alert, marking it as reviewed
- [ ] **ALRT-04**: Operator can dismiss an alert as false positive with a reason
- [ ] **ALRT-05**: Operator can resolve an alert, optionally linking it to an incident
- [ ] **ALRT-06**: New alerts appear on dashboard in real-time via WebSocket within 1 second of creation
- [ ] **ALRT-07**: Alert list supports pagination (cursor-based on created_at) and sorting

### Missing Persons

- [ ] **MISS-01**: Operator can create a missing person case with name, age, description, last seen location, date reported, and priority (Normal, High, Urgent)
- [ ] **MISS-02**: Operator can upload one or more photos for a missing person case
- [ ] **MISS-03**: Operator can update case details and status (Reported, Active Search, Priority, Found, Closed)
- [ ] **MISS-04**: Operator can assign a case officer to a missing person case
- [ ] **MISS-05**: Operator can search missing persons by name, ID, or last seen location
- [ ] **MISS-06**: Missing person list supports pagination, filtering by status/priority, and sorting
- [ ] **MISS-07**: When AI detects a missing person match, an alert is auto-generated and linked to the case

### Officers & Assignments

- [ ] **OFCR-01**: Admin can create, update, and deactivate officer profiles (name, badge number, unit type, contact info)
- [ ] **OFCR-02**: Operator can assign an officer to an incident or alert with assignment details
- [ ] **OFCR-03**: Assignment status tracked: Assigned → En Route → On Site → Completed
- [ ] **OFCR-04**: Officer can update their own assignment status via mobile app API
- [ ] **OFCR-05**: Operator can view officer list with current assignment status and location
- [ ] **OFCR-06**: Response Board API provides officer lists grouped by assignment status (Standby, En Route, On Site)

### Real-Time System

- [ ] **RTWS-01**: WebSocket endpoint accepts connections authenticated via JWT token
- [ ] **RTWS-02**: ConnectionManager maintains active connections with topic-based channels (alerts, incidents, system, assignments)
- [ ] **RTWS-03**: Alert creation broadcasts to all connected dashboard clients within 1 second
- [ ] **RTWS-04**: Incident status changes broadcast to all connected clients
- [ ] **RTWS-05**: Assignment status changes broadcast to all connected clients
- [ ] **RTWS-06**: System health status changes broadcast to all connected clients
- [ ] **RTWS-07**: Stale connections cleaned up via heartbeat mechanism (30s ping, 60s timeout)
- [ ] **RTWS-08**: WebSocket sends fail gracefully (connection removed on error, no server crash)

### AI Event Pipeline

- [ ] **AIEV-01**: Backend exposes POST /api/v1/ai-events endpoint accepting detection event payloads (camera_id, timestamp, confidence, person_id, match_type, snapshot_url, location, status)
- [ ] **AIEV-02**: Detection events are validated against schema and stored in detection_events table
- [ ] **AIEV-03**: Valid detection events automatically generate an alert record
- [ ] **AIEV-04**: High-confidence detections (≥ configurable threshold) auto-create an incident
- [ ] **AIEV-05**: All detection events broadcast via WebSocket to connected clients
- [ ] **AIEV-06**: AI event ingestion is fault-isolated: malformed events do not crash the endpoint

### Mock AI Engine

- [ ] **MOCK-01**: Mock AI engine generates realistic detection events at configurable intervals (default: every 10-30 seconds)
- [ ] **MOCK-02**: Mock events rotate through configured camera IDs and locations
- [ ] **MOCK-03**: Mock events produce realistic confidence scores (70-99% distribution)
- [ ] **MOCK-04**: Mock engine occasionally generates missing person match events (match_type: missing_person)
- [ ] **MOCK-05**: Mock engine can be started/stopped via API endpoint
- [ ] **MOCK-06**: Mock engine behavior is identical to future real AI engine event format

### Notifications

- [ ] **NOTF-01**: System generates notifications for: new alerts, incident assignments, status changes, AI health changes
- [ ] **NOTF-02**: Notifications delivered in real-time via WebSocket to relevant users
- [ ] **NOTF-03**: User can view their notification list with unread count
- [ ] **NOTF-04**: User can mark notifications as read (individual or all)

### Evidence & Activity Logging

- [ ] **EVID-01**: User can upload evidence files (images, documents) linked to incidents or missing person cases
- [ ] **EVID-02**: Evidence files served through authenticated API endpoint (not static files)
- [ ] **EVID-03**: Evidence metadata stored in database (filename, type, size, upload date, uploader, linked entity)
- [ ] **ACTV-01**: All CRUD operations logged with: user, timestamp, action, entity type, entity ID, details
- [ ] **ACTV-02**: Activity log queryable with filtering by entity type, user, action, and date range
- [ ] **ACTV-03**: Activity log supports pagination and sorting

### System Health

- [ ] **HLTH-01**: GET /health/live returns 200 if backend process is running (liveness probe)
- [ ] **HLTH-02**: GET /health/ready returns 200 only if database is connected and migrations are current (readiness probe)
- [ ] **HLTH-03**: GET /health/ai returns AI engine status (online/offline/degraded) using circuit breaker pattern
- [ ] **HLTH-04**: System status endpoint returns combined health of Backend, Database, and AI Engine
- [ ] **HLTH-05**: AI engine health check uses 5-second timeout and circuit breaker (open after 3 failures, reset after 30 seconds)

### Frontend Integration

- [ ] **FINT-01**: Dashboard Command Overview page loads real data from backend APIs (stats, latest match, activity feed, patrol status)
- [ ] **FINT-02**: Dashboard Alerts page loads alerts from backend with real-time WebSocket updates
- [ ] **FINT-03**: Dashboard Missing Persons page loads from backend with working search, filters, and New Case form
- [ ] **FINT-04**: Dashboard Patrol page loads officer/unit data from backend with real statuses
- [ ] **FINT-05**: Dashboard Response Board loads assignments from backend grouped by status
- [ ] **FINT-06**: Dashboard Logs page loads activity logs from backend with pagination
- [ ] **FINT-07**: Dashboard System pages (Services, Users, Settings) connected to backend APIs
- [ ] **FINT-08**: All dashboard buttons and forms submit to real backend endpoints

### Mobile Integration

- [ ] **MINT-01**: Mobile Login screen authenticates against backend JWT endpoint
- [ ] **MINT-02**: Mobile Alerts screen loads alerts from backend with real-time WebSocket updates
- [ ] **MINT-03**: Mobile Alert Details screen loads full alert data and supports confirm/dismiss actions
- [ ] **MINT-04**: Mobile Cases screen loads missing person cases from backend
- [ ] **MINT-05**: Mobile Logs screen loads activity logs from backend
- [ ] **MINT-06**: Mobile Map screen loads officer/patrol locations from backend
- [ ] **MINT-07**: Mobile Profile screen loads and updates officer profile from backend

### API Standards

- [ ] **APIS-01**: All list endpoints support pagination with page/limit parameters
- [ ] **APIS-02**: All list endpoints support filtering by relevant fields
- [ ] **APIS-03**: All list endpoints support sorting by relevant fields
- [ ] **APIS-04**: All API responses use consistent envelope format: `{ success, data, error, meta }`
- [ ] **APIS-05**: All errors return structured error responses with error code, message, and details
- [ ] **APIS-06**: OpenAPI/Swagger documentation auto-generated and accessible at /docs
- [ ] **APIS-07**: CORS configured for web dashboard and mobile app origins

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### AI Engine (Real)

- **AIML-01**: Real-time face detection using YOLO/RetinaFace on camera feeds
- **AIML-02**: Face embedding generation using ArcFace
- **AIML-03**: Vector similarity search using FAISS against missing person database
- **AIML-04**: Multi-camera person tracking (same person across camera feeds)

### Advanced Features

- **ADVN-01**: Predictive patrol routing based on historical detection data
- **ADVN-02**: Notification preferences per user (channel, frequency, severity filter)
- **ADVN-03**: Alert escalation rules (auto-escalate unacknowledged alerts after configurable time)
- **ADVN-04**: Evidence chain of custody tracking with digital signatures
- **ADVN-05**: API rate limiting per user/role

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real AI model training | Requires GPU infrastructure, different lifecycle — separate milestone |
| Camera RTSP/HLS stream ingestion | Requires AI engine for frame processing — AI engine milestone |
| Real face embedding generation | ArcFace/FAISS integration — AI engine milestone |
| Multi-tenancy | Not needed for single-city deployment; future scaling concern |
| Public citizen portal | Internal operational tool only |
| SSO/OAuth | JWT sufficient for v1 internal tool |
| Docker/Kubernetes | Deployment concern, not build concern |
| Payment/billing | Not applicable to public safety domain |
| Video streaming through backend | Massive bandwidth; use direct camera→client streaming instead |
| Real-time sync face recognition | Too slow for sync API; async detection pipeline handles this |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DBFN-01 | Phase 1 | Pending |
| DBFN-02 | Phase 1 | Pending |
| DBFN-03 | Phase 1 | Pending |
| DBFN-04 | Phase 1 | Pending |
| DBFN-05 | Phase 1 | Pending |
| DBFN-06 | Phase 1 | Pending |
| DBFN-07 | Phase 1 | Pending |
| APIS-04 | Phase 1 | Pending |
| APIS-05 | Phase 1 | Pending |
| APIS-07 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| AUTH-07 | Phase 2 | Pending |
| AUTH-08 | Phase 2 | Pending |
| AUTH-09 | Phase 2 | Pending |
| INCI-01 | Phase 2 | Pending |
| INCI-02 | Phase 2 | Pending |
| INCI-03 | Phase 2 | Pending |
| INCI-04 | Phase 2 | Pending |
| INCI-05 | Phase 2 | Pending |
| INCI-06 | Phase 2 | Pending |
| INCI-07 | Phase 2 | Pending |
| INCI-08 | Phase 2 | Pending |
| ALRT-02 | Phase 2 | Pending |
| ALRT-03 | Phase 2 | Pending |
| ALRT-04 | Phase 2 | Pending |
| ALRT-05 | Phase 2 | Pending |
| ALRT-07 | Phase 2 | Pending |
| MISS-01 | Phase 2 | Pending |
| MISS-02 | Phase 2 | Pending |
| MISS-03 | Phase 2 | Pending |
| MISS-04 | Phase 2 | Pending |
| MISS-05 | Phase 2 | Pending |
| MISS-06 | Phase 2 | Pending |
| OFCR-01 | Phase 2 | Pending |
| OFCR-02 | Phase 2 | Pending |
| OFCR-03 | Phase 2 | Pending |
| OFCR-04 | Phase 2 | Pending |
| OFCR-05 | Phase 2 | Pending |
| OFCR-06 | Phase 2 | Pending |
| APIS-01 | Phase 2 | Pending |
| APIS-02 | Phase 2 | Pending |
| APIS-03 | Phase 2 | Pending |
| APIS-06 | Phase 2 | Pending |
| RTWS-01 | Phase 3 | Pending |
| RTWS-02 | Phase 3 | Pending |
| RTWS-03 | Phase 3 | Pending |
| RTWS-04 | Phase 3 | Pending |
| RTWS-05 | Phase 3 | Pending |
| RTWS-06 | Phase 3 | Pending |
| RTWS-07 | Phase 3 | Pending |
| RTWS-08 | Phase 3 | Pending |
| ALRT-01 | Phase 4 | Pending |
| ALRT-06 | Phase 4 | Pending |
| MISS-07 | Phase 4 | Pending |
| AIEV-01 | Phase 4 | Pending |
| AIEV-02 | Phase 4 | Pending |
| AIEV-03 | Phase 4 | Pending |
| AIEV-04 | Phase 4 | Pending |
| AIEV-05 | Phase 4 | Pending |
| AIEV-06 | Phase 4 | Pending |
| MOCK-01 | Phase 4 | Pending |
| MOCK-02 | Phase 4 | Pending |
| MOCK-03 | Phase 4 | Pending |
| MOCK-04 | Phase 4 | Pending |
| MOCK-05 | Phase 4 | Pending |
| MOCK-06 | Phase 4 | Pending |
| HLTH-03 | Phase 4 | Pending |
| HLTH-05 | Phase 4 | Pending |
| NOTF-01 | Phase 5 | Pending |
| NOTF-02 | Phase 5 | Pending |
| NOTF-03 | Phase 5 | Pending |
| NOTF-04 | Phase 5 | Pending |
| EVID-01 | Phase 5 | Pending |
| EVID-02 | Phase 5 | Pending |
| EVID-03 | Phase 5 | Pending |
| ACTV-01 | Phase 5 | Pending |
| ACTV-02 | Phase 5 | Pending |
| ACTV-03 | Phase 5 | Pending |
| FINT-01 | Phase 6 | Pending |
| FINT-02 | Phase 6 | Pending |
| FINT-03 | Phase 6 | Pending |
| FINT-04 | Phase 6 | Pending |
| FINT-05 | Phase 6 | Pending |
| FINT-06 | Phase 6 | Pending |
| FINT-07 | Phase 6 | Pending |
| FINT-08 | Phase 6 | Pending |
| MINT-01 | Phase 6 | Pending |
| MINT-02 | Phase 6 | Pending |
| MINT-03 | Phase 6 | Pending |
| MINT-04 | Phase 6 | Pending |
| MINT-05 | Phase 6 | Pending |
| MINT-06 | Phase 6 | Pending |
| MINT-07 | Phase 6 | Pending |
| HLTH-01 | Phase 7 | Pending |
| HLTH-02 | Phase 7 | Pending |
| HLTH-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 82 total
- Mapped to phases: 82
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-31*
*Last updated: 2026-05-31 after roadmap creation*
