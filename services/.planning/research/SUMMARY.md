# Project Research Summary

**Project:** GARUDA A.S.T.R.A
**Domain:** AI-Powered Public Safety Surveillance Backend
**Researched:** 2026-05-31
**Confidence:** HIGH

## Executive Summary

GARUDA A.S.T.R.A is an AI-first surveillance intelligence platform that requires a production-grade FastAPI backend to replace the current hardcoded mock data in both the Next.js web dashboard and React Native mobile app. The backend must serve as an AI orchestration layer, real-time event processor, and operational intelligence backend — not merely a CRUD API.

The recommended approach is a layered FastAPI architecture using async SQLAlchemy with PostgreSQL, a dedicated WebSocket connection manager for real-time broadcasting, and a circuit-breaker-protected AI event ingestion pipeline. The key architectural constraint is fault isolation: the AI engine must be completely decoupled from operational workflows so that AI failures never crash the control room.

The most significant risks are: (1) using synchronous database calls that block the async event loop, (2) tight coupling to the AI engine causing cascading failures, and (3) WebSocket memory leaks from unmanaged stale connections. All three are addressed in the phase structure below.

## Key Findings

### Recommended Stack

The 2025 standard for async Python API backends is FastAPI + SQLAlchemy 2.0 (AsyncSession) + asyncpg + PostgreSQL. This stack provides native async performance, auto-generated OpenAPI docs, and Pydantic-based validation.

**Core technologies:**
- **FastAPI 0.115+**: Async-native API framework — auto-docs, WebSocket support, dependency injection
- **SQLAlchemy 2.0+ (AsyncSession)**: Industry standard ORM with async support — prevents event loop blocking
- **PostgreSQL 16+**: Relational integrity for incident/alert/assignment chains, JSONB for flexible AI payloads
- **Alembic 1.14+**: Schema migration management — required from day 1

### Expected Features

**Must have (table stakes):**
- JWT auth with role-based access (Admin, Operator, Officer)
- Incident CRUD with status transitions and timelines
- Alert creation, acknowledgement, and real-time broadcasting
- Missing person registry with image upload and case tracking
- Officer assignment and dispatch tracking
- WebSocket real-time updates for dashboard and mobile
- Activity/audit logging for all operations
- System health monitoring (AI/Backend/DB status)
- Pagination, filtering, sorting on all list endpoints

**Should have (competitive):**
- AI event ingestion pipeline with auto-alert generation
- Auto-incident creation from high-confidence detections
- Mock AI engine with realistic detection simulation
- Fault-tolerant AI degradation with clear operator indication

**Defer (v2+):**
- Real AI model integration (YOLO/ArcFace/FAISS)
- Multi-camera correlation
- Predictive patrol routing

### Architecture Approach

The system uses a three-layer architecture: client layer (Next.js + React Native), API layer (FastAPI backend-api with modular routers/services/models), and AI layer (isolated FastAPI ai-engine). The backend follows a service-oriented pattern where thin routers delegate to business logic services, which interact with the database via SQLAlchemy and broadcast events via a WebSocket ConnectionManager.

**Major components:**
1. **Backend-API** — Operational workflows, auth, CRUD, WebSocket broadcasting, AI event ingestion
2. **AI-Engine** — Video processing, face detection, event emission (mock for v1, real for v2)
3. **WebSocket Manager** — Real-time bidirectional communication with topic-based channels
4. **Health Monitor** — Liveness/readiness probes with circuit breaker for AI engine

### Critical Pitfalls

1. **Synchronous database calls** — Use AsyncSession + asyncpg exclusively; one sync query blocks all concurrent connections
2. **AI engine hard dependency** — Circuit breaker + 5s timeouts + cached health status; test with AI engine stopped
3. **WebSocket memory leaks** — Implement heartbeat + connection timeout + send failure cleanup
4. **Missing database indexes** — Index all WHERE/ORDER BY columns; composite indexes for filtered+sorted queries
5. **Leaking internal data** — Always use Pydantic response schemas; never return ORM models directly

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Database Foundation & Project Scaffolding
**Rationale:** Everything depends on the database schema and project structure; must be first
**Delivers:** FastAPI project scaffold, SQLAlchemy models for all 16+ entities, Alembic migrations, database connection management
**Addresses:** Database schema design, model definitions, migration infrastructure
**Avoids:** Sync database calls pitfall — async-only from the start

### Phase 2: Authentication & Core API
**Rationale:** Auth is required before any protected endpoint can be built; core CRUD is the foundation for all workflows
**Delivers:** JWT auth system (login, register, refresh, logout), user/role management, incident CRUD, alert CRUD, missing person CRUD, officer management
**Addresses:** Auth, RBAC, core operational workflows
**Avoids:** JWT expiry pitfall, data leaking pitfall

### Phase 3: Real-Time System & WebSocket
**Rationale:** Real-time updates are the differentiator — but require stable CRUD endpoints to broadcast meaningful events
**Delivers:** WebSocket ConnectionManager, alert broadcasting, incident status updates, system health broadcasting
**Addresses:** Real-time dashboard, mobile synchronization
**Avoids:** WebSocket memory leak pitfall

### Phase 4: AI Event Pipeline & Mock Engine
**Rationale:** AI integration requires stable CRUD + WebSocket; mock engine validates the entire detection→alert→dispatch pipeline
**Delivers:** AI event ingestion endpoint, alert auto-generation, auto-incident creation, mock AI event generator
**Addresses:** AI event processing, fault-tolerant degradation
**Avoids:** AI hard dependency pitfall — circuit breaker from the start

### Phase 5: Notification, Evidence & Activity Systems
**Rationale:** Supporting systems that enhance core workflows but aren't blockers
**Delivers:** Notification system, evidence management with file upload, comprehensive activity logging
**Addresses:** Notification delivery, evidence chain, audit trail

### Phase 6: Frontend & Mobile Integration
**Rationale:** Backend must be stable and feature-complete before replacing frontend mock data
**Delivers:** All dashboard pages connected to real APIs, all mobile screens connected, WebSocket integration in both clients
**Addresses:** Replacing hardcoded mock data, wiring forms/buttons/tables

### Phase 7: System Health, Polish & Hardening
**Rationale:** Final phase — monitoring, error handling, performance tuning, security hardening
**Delivers:** Health endpoints, system status dashboard, API documentation review, security audit, load testing
**Addresses:** Production readiness, observability

### Phase Ordering Rationale

- Phases 1-2 establish the data layer and core API — everything else depends on these
- Phase 3 adds real-time capability before AI events exist (can broadcast CRUD events)
- Phase 4 builds the AI pipeline on top of working CRUD + WebSocket — validates end-to-end flow
- Phase 5 adds supporting systems that are useful but not blocking
- Phase 6 integrates frontends last because the backend must be stable first
- Phase 7 hardens everything before production deployment

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** WebSocket scaling patterns — need to research ConnectionManager design, heartbeat implementation
- **Phase 4:** Mock AI event simulation — need to research realistic detection event patterns, timing, confidence distributions

Phases with standard patterns (skip research-phase):
- **Phase 1:** Database schema — well-documented SQLAlchemy patterns
- **Phase 2:** JWT auth — FastAPI security docs are comprehensive
- **Phase 5:** File upload — standard aiofiles + multipart patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | FastAPI + SQLAlchemy 2.0 + PostgreSQL is the established 2025 standard |
| Features | HIGH | Feature set derived from existing frontend analysis + domain research |
| Architecture | HIGH | Layered service pattern is well-proven for this type of system |
| Pitfalls | HIGH | Based on documented production post-mortems and known async Python issues |

**Overall confidence:** HIGH

### Gaps to Address

- **AI engine API contract:** The mock AI engine must match what the real AI engine will eventually produce. Contract should be defined early and version-controlled.
- **File storage strategy:** v1 uses local filesystem; need to design the storage abstraction to be swappable to S3 later without code changes.
- **WebSocket authentication:** Need to decide between query-param JWT (simpler) vs initial message auth (more secure) during Phase 3 planning.

## Sources

### Primary (HIGH confidence)
- FastAPI official documentation — async patterns, WebSocket, security
- SQLAlchemy 2.0 documentation — AsyncSession, async engine
- Existing frontend code analysis — all pages, screens, mock data structures

### Secondary (MEDIUM confidence)
- Web search — FastAPI production architecture best practices 2025
- Web search — AI surveillance platform architecture patterns
- Web search — FastAPI fault tolerance and circuit breaker patterns

### Tertiary (LOW confidence)
- Competitor product analysis (Axon, Milestone) — limited public technical documentation

---
*Research completed: 2026-05-31*
*Ready for roadmap: yes*
