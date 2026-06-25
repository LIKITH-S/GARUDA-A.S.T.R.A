# Architecture Research

**Domain:** AI-Powered Public Safety Surveillance Backend
**Researched:** 2026-05-31
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  ┌──────────────────┐  ┌──────────────────┐                         │
│  │  Web Dashboard   │  │   Mobile App     │                         │
│  │  (Next.js)       │  │  (React Native)  │                         │
│  └────────┬─────────┘  └────────┬─────────┘                         │
│           │ REST + WS           │ REST + WS                         │
├───────────┴─────────────────────┴───────────────────────────────────┤
│                     API GATEWAY LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                   FastAPI Backend-API                         │    │
│  │  ┌──────┐ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │    │
│  │  │ Auth │ │ Routes │ │ Services │ │ WebSocket│ │  Health │ │    │
│  │  │      │ │        │ │          │ │ Manager  │ │  Check  │ │    │
│  │  └──────┘ └────────┘ └──────────┘ └──────────┘ └─────────┘ │    │
│  └──────────────────────────┬───────────────────────────────────┘    │
│                             │                                        │
├─────────────────────────────┴────────────────────────────────────────┤
│                     DATA LAYER                                       │
│  ┌──────────────────┐  ┌──────────────────┐                         │
│  │   PostgreSQL     │  │   File Storage   │                         │
│  │   (Primary DB)   │  │   (Evidence)     │                         │
│  └──────────────────┘  └──────────────────┘                         │
├──────────────────────────────────────────────────────────────────────┤
│                     AI LAYER (Isolated)                               │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                   FastAPI AI-Engine                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │    │
│  │  │ Video    │ │ Face     │ │ Vector   │ │ Event    │        │    │
│  │  │ Process  │ │ Detect   │ │ Search   │ │ Emitter  │        │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Backend-API | Operational workflows, auth, CRUD, WebSocket broadcasting, AI event ingestion | FastAPI with modular routers, SQLAlchemy repos, Pydantic schemas |
| AI-Engine | Video processing, face detection, embedding generation, vector search, event emission | FastAPI service with OpenCV, PyTorch, FAISS (future); mock generator for now |
| PostgreSQL | Persistent storage for all operational data — users, incidents, alerts, detections, assignments | Normalized relational schema with Alembic migrations |
| WebSocket Manager | Real-time bidirectional communication with dashboard and mobile clients | In-process ConnectionManager with topic-based channels |
| Auth Module | JWT token lifecycle, password hashing, role enforcement, middleware guards | python-jose + passlib + FastAPI dependencies |
| Health Monitor | Liveness/readiness probes, AI engine health polling, database connectivity check | /health/live, /health/ready, /health/ai endpoints with circuit breaker |

## Recommended Project Structure

```
services/backend-api/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app factory, lifespan, middleware
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Shared dependencies (get_db, get_current_user)
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── router.py        # Aggregate v1 router
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic BaseSettings — env config
│   │   ├── security.py          # JWT creation, password hashing
│   │   └── exceptions.py        # Custom exception classes + handlers
│   ├── database/
│   │   ├── __init__.py
│   │   ├── session.py           # AsyncSession factory, engine
│   │   └── base.py              # Declarative base, metadata
│   ├── models/
│   │   ├── __init__.py          # Re-exports all models for Alembic
│   │   ├── user.py
│   │   ├── officer.py
│   │   ├── incident.py
│   │   ├── alert.py
│   │   ├── missing_person.py
│   │   ├── detection_event.py
│   │   ├── assignment.py
│   │   ├── notification.py
│   │   ├── activity_log.py
│   │   ├── evidence.py
│   │   ├── camera_feed.py
│   │   └── system_status.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py              # Pydantic request/response schemas
│   │   ├── incident.py
│   │   ├── alert.py
│   │   ├── missing_person.py
│   │   ├── detection_event.py
│   │   ├── assignment.py
│   │   ├── notification.py
│   │   ├── common.py            # Pagination, envelope, error schemas
│   │   └── health.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py              # Login, register, token refresh
│   │   ├── user.py
│   │   ├── incident.py
│   │   ├── alert.py
│   │   ├── missing_person.py
│   │   ├── officer.py
│   │   ├── assignment.py
│   │   ├── notification.py
│   │   ├── activity_log.py
│   │   ├── evidence.py
│   │   ├── ai_event.py          # AI event validation, alert generation
│   │   ├── health.py
│   │   └── mock_ai.py           # Mock AI event generator
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── incidents.py
│   │   ├── alerts.py
│   │   ├── missing_persons.py
│   │   ├── officers.py
│   │   ├── assignments.py
│   │   ├── notifications.py
│   │   ├── activity_logs.py
│   │   ├── evidence.py
│   │   ├── ai_events.py
│   │   └── health.py
│   ├── websocket/
│   │   ├── __init__.py
│   │   ├── manager.py           # ConnectionManager with topic channels
│   │   └── handlers.py          # WebSocket endpoint handlers
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py              # JWT verification middleware
│   │   ├── logging.py           # Request/response logging
│   │   └── cors.py              # CORS configuration
│   └── utils/
│       ├── __init__.py
│       ├── pagination.py        # Pagination helpers
│       └── response.py          # Standard response envelope
├── alembic/
│   ├── env.py                   # Async migration environment
│   ├── versions/                # Migration scripts
│   └── alembic.ini
├── tests/
│   ├── conftest.py              # Test fixtures, async DB setup
│   ├── test_auth.py
│   ├── test_incidents.py
│   ├── test_alerts.py
│   └── ...
├── requirements.txt
├── .env.example
└── README.md
```

### Structure Rationale

- **models/ (separate from routers):** SQLAlchemy models define the database schema independently of API concerns; Alembic imports from here
- **schemas/ (Pydantic, separate from models):** Request/response validation schemas are API concerns, not database concerns; prevents ORM models from leaking into API responses
- **services/ (business logic layer):** Keeps routers thin (validation + delegation); services are testable without HTTP; services can be reused across routers and WebSocket handlers
- **routers/ (thin HTTP layer):** Only handles request parsing, dependency injection, and response formatting; delegates all logic to services
- **websocket/ (isolated):** WebSocket is a separate protocol with different lifecycle; connection management is complex enough to warrant its own module

## Architectural Patterns

### Pattern 1: Repository/Service Layer

**What:** Business logic lives in services, data access in repositories (or directly in services using SQLAlchemy for simpler projects)
**When to use:** Always — prevents router bloat and makes services testable
**Trade-offs:** Slight indirection; worth it for testability and reuse

**Example:**
```python
# routers/incidents.py — thin
@router.post("/", response_model=IncidentResponse)
async def create_incident(
    data: IncidentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await incident_service.create(db, data, user)

# services/incident.py — business logic
async def create(db: AsyncSession, data: IncidentCreate, user: User) -> Incident:
    incident = Incident(**data.model_dump(), created_by=user.id)
    db.add(incident)
    await db.commit()
    await activity_log_service.log(db, "incident.created", incident.id, user.id)
    await websocket_manager.broadcast("incidents", {"type": "created", "data": incident})
    return incident
```

### Pattern 2: Event-Driven Alert Pipeline

**What:** AI detection events flow through a pipeline: validate → store → generate alert → broadcast → auto-incident
**When to use:** Every AI detection event
**Trade-offs:** More complex than simple CRUD; essential for real-time responsiveness

**Example:**
```python
# services/ai_event.py
async def process_detection(db: AsyncSession, event: DetectionEventCreate):
    # 1. Validate and store
    detection = DetectionEvent(**event.model_dump())
    db.add(detection)

    # 2. Generate alert
    alert = Alert(
        detection_id=detection.id,
        severity=classify_severity(event.confidence),
        status="pending",
    )
    db.add(alert)

    # 3. Auto-create incident if high confidence
    if event.confidence >= settings.AUTO_INCIDENT_THRESHOLD:
        incident = await incident_service.create_from_alert(db, alert)

    await db.commit()

    # 4. Broadcast via WebSocket
    await websocket_manager.broadcast("alerts", alert.to_dict())
```

### Pattern 3: Circuit Breaker for AI Engine

**What:** Wrap AI engine health checks in a circuit breaker to prevent cascading failures
**When to use:** Every call from backend-api to ai-engine
**Trade-offs:** Adds complexity; prevents entire backend from hanging when AI is down

**Example:**
```python
import pybreaker

ai_breaker = pybreaker.CircuitBreaker(
    fail_max=3,
    reset_timeout=30,
    exclude=[httpx.TimeoutException],
)

@ai_breaker
async def check_ai_health() -> dict:
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(f"{settings.AI_ENGINE_URL}/health")
        return response.json()
```

## Data Flow

### Alert Pipeline Flow

```
[AI Engine] ──POST /api/v1/ai-events──> [Backend-API]
                                              │
                                    ┌─────────┴─────────┐
                                    │ Validate Event     │
                                    │ Store Detection    │
                                    │ Generate Alert     │
                                    │ Check Threshold    │
                                    └─────────┬─────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                         [PostgreSQL]   [WebSocket]    [Auto-Incident?]
                         Store alert    Broadcast to    Create incident
                                        all clients     if confidence >= threshold
```

### Authentication Flow

```
[Client] ──POST /auth/login──> [Backend]
                                   │
                          ┌────────┴────────┐
                          │ Verify password  │
                          │ Generate JWT     │
                          │ Generate Refresh │
                          └────────┬────────┘
                                   │
                              [JWT Token]
                                   │
[Client] ──GET /api/* + Bearer──> [Middleware]
                                      │
                            ┌─────────┴─────────┐
                            │ Decode JWT         │
                            │ Check expiry       │
                            │ Check role         │
                            │ Attach user to req │
                            └─────────┬─────────┘
                                      │
                                 [Protected Route]
```

### WebSocket Connection Flow

```
[Client] ──WS /ws?token=JWT──> [Backend]
                                   │
                          ┌────────┴────────┐
                          │ Validate JWT     │
                          │ Register conn    │
                          │ Subscribe topics │
                          └────────┬────────┘
                                   │
                           [Connection Active]
                                   │
[Backend Event] ──broadcast──> [ConnectionManager]
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              [Dashboard WS] [Mobile WS]  [Admin WS]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-10 operators, 1-50 cameras | Single FastAPI process, single PostgreSQL instance, in-process WebSocket manager — this is the v1 target |
| 10-50 operators, 50-500 cameras | Multiple Uvicorn workers, Redis Pub/Sub for cross-worker WebSocket broadcast, connection pooling tuning |
| 50+ operators, 500+ cameras | Separate WebSocket gateway service, dedicated AI engine scaling, PostgreSQL read replicas, time-series partitioning for detection events |

### Scaling Priorities

1. **First bottleneck:** WebSocket connections per worker — when a single worker hits ~1000 connections, add workers + Redis Pub/Sub
2. **Second bottleneck:** Database write throughput for detection events — partition detection_events table by timestamp, batch inserts

## Anti-Patterns

### Anti-Pattern 1: Fat Routers

**What people do:** Put business logic, database queries, and WebSocket broadcasting directly in router handlers
**Why it's wrong:** Untestable, duplicated logic across endpoints, WebSocket and REST logic diverge
**Do this instead:** Thin routers that delegate to services; services are reusable and testable

### Anti-Pattern 2: Synchronous Calls in Async Context

**What people do:** Use synchronous database drivers, blocking HTTP libraries, or CPU-heavy code in async handlers
**Why it's wrong:** Blocks the entire event loop — one slow query freezes all concurrent requests
**Do this instead:** Use asyncpg, httpx, aiofiles; offload CPU work to thread pool or background process

### Anti-Pattern 3: AI Engine as Hard Dependency

**What people do:** Import AI engine modules directly into backend, or make synchronous calls that block if AI is down
**Why it's wrong:** AI engine failure takes down the entire platform
**Do this instead:** HTTP-based service boundary with circuit breaker; backend degrades gracefully to "AI offline" mode

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| AI Engine | HTTP POST for events, HTTP GET for health | Circuit breaker, 5s timeout, retry with backoff |
| File Storage | Local filesystem (v1), S3-compatible (future) | Evidence images, missing person photos |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Router ↔ Service | Direct Python call | Same process, dependency injection |
| Service ↔ Database | AsyncSession via SQLAlchemy | Connection pool managed centrally |
| Service ↔ WebSocket | ConnectionManager.broadcast() | In-process; Redis Pub/Sub for multi-worker |
| Backend-API ↔ AI-Engine | HTTP REST | Separate processes, potentially separate machines |

## Sources

- FastAPI production architecture best practices 2025
- Public safety technology architecture patterns
- SQLAlchemy 2.0 async documentation
- Circuit breaker pattern for microservices (pybreaker)

---
*Architecture research for: AI-Powered Public Safety Surveillance Backend*
*Researched: 2026-05-31*
