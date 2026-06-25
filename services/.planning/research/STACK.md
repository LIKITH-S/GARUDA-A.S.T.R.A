# Stack Research

**Domain:** AI-Powered Public Safety Surveillance Backend
**Researched:** 2026-05-31
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| FastAPI | 0.115+ | Async REST/WebSocket API framework | Native async, auto-OpenAPI docs, WebSocket support, Pydantic validation built-in, dominant Python API framework in 2025 |
| SQLAlchemy | 2.0+ | Async ORM with `AsyncSession` | Industry standard Python ORM, async support with `create_async_engine`, relationship loading strategies prevent N+1 |
| PostgreSQL | 16+ | Primary relational database | ACID compliance critical for incident/alert records, JSONB for flexible AI event payloads, strong indexing for time-series queries |
| Alembic | 1.14+ | Database migration management | Only serious SQLAlchemy migration tool, auto-generates from model diffs, supports async |
| Uvicorn | 0.32+ | ASGI server | High-performance async server, WebSocket support, production-ready with `--workers` |
| Pydantic | 2.10+ | Data validation & serialization | Native FastAPI integration, schema-first API design, serialization performance |
| Python | 3.12+ | Runtime | Best async performance, improved error messages, typing improvements |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| asyncpg | 0.30+ | Async PostgreSQL driver | Required — the async driver under SQLAlchemy's async engine |
| python-jose[cryptography] | 3.3+ | JWT token encoding/decoding | Auth system — token creation and validation |
| passlib[bcrypt] | 1.7+ | Password hashing | User registration and login — bcrypt hashing |
| python-multipart | 0.0.18+ | File upload parsing | Evidence file uploads, missing person image uploads |
| websockets | 14+ | WebSocket protocol implementation | Real-time alert broadcasting, dashboard live updates |
| httpx | 0.28+ | Async HTTP client | Backend→AI engine health checks, inter-service communication |
| python-dotenv | 1.1+ | Environment variable loading | Config management from .env files |
| structlog | 24.4+ | Structured logging | Production logging with JSON output, correlation IDs |
| tenacity | 9.0+ | Retry logic with backoff | AI engine communication retries, graceful degradation |
| pybreaker | 1.2+ | Circuit breaker pattern | AI engine fault isolation — prevent cascading failures |
| aiofiles | 24.1+ | Async file operations | Evidence file storage, image uploads without blocking event loop |
| orjson | 3.10+ | Fast JSON serialization | WebSocket message serialization, API response performance |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pytest + pytest-asyncio | Async test runner | Use `@pytest.mark.asyncio` for async endpoint tests |
| httpx (TestClient) | API integration tests | FastAPI's recommended test client |
| ruff | Linting + formatting | Replaces flake8/black/isort — single tool, very fast |
| mypy | Type checking | Catch type errors before runtime, SQLAlchemy plugin available |
| pre-commit | Git hooks | Auto-format and lint before commits |

## Installation

```bash
# Core
pip install fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic pydantic

# Auth & Security
pip install python-jose[cryptography] passlib[bcrypt] python-multipart

# Real-time & Communication
pip install websockets httpx aiofiles

# Resilience
pip install tenacity pybreaker

# Utilities
pip install python-dotenv structlog orjson

# Dev dependencies
pip install pytest pytest-asyncio httpx ruff mypy pre-commit
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| FastAPI | Django REST Framework | When you need Django's admin panel or ORM conventions; not appropriate here due to async requirements |
| FastAPI | Express.js (Node) | When team is JS-only; not appropriate here since AI engine is Python |
| SQLAlchemy 2.0 | Tortoise ORM | Lighter async ORM, but less mature ecosystem, weaker migration tooling |
| PostgreSQL | MongoDB | When schema is truly unstructured; relational integrity is critical for incident/alert/officer data |
| asyncpg | psycopg3 | Viable alternative async driver; asyncpg has better raw performance benchmarks |
| structlog | loguru | Simpler API but less structured output; structlog better for production observability |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Flask | Synchronous — blocks on I/O, no native WebSocket, no auto-docs | FastAPI |
| Django (for this use case) | Sync-first ORM, heavy middleware stack, async support is bolted-on | FastAPI + SQLAlchemy |
| SQLAlchemy 1.x sync sessions | Blocks the event loop, destroys concurrency under load | SQLAlchemy 2.0 AsyncSession |
| psycopg2 (sync) | Synchronous driver — freezes entire event loop on every query | asyncpg |
| Celery (for v1) | Over-engineered for mock AI; adds Redis/RabbitMQ infrastructure dependency | asyncio.create_task + in-process background tasks |
| Socket.IO | Adds unnecessary protocol complexity; FastAPI native WebSocket is sufficient | FastAPI WebSocket |
| MongoDB | Loses relational integrity needed for incident↔alert↔officer↔assignment chains | PostgreSQL |

## Stack Patterns by Variant

**If deploying behind a reverse proxy (Nginx/Traefik):**
- Use Uvicorn with `--proxy-headers` and `--forwarded-allow-ips`
- Let the proxy handle TLS termination
- WebSocket upgrade headers must be forwarded

**If scaling to multiple workers:**
- Use Redis Pub/Sub for WebSocket message broadcasting across worker processes
- Each worker maintains its own WebSocket connection pool
- Shared state (sessions, alerts) must go through PostgreSQL or Redis

**If AI engine is on a separate machine:**
- Use httpx with circuit breaker for health checks
- Implement retry with exponential backoff for event ingestion
- Backend must cache last-known AI health status

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| FastAPI 0.115+ | Pydantic 2.10+ | FastAPI requires Pydantic v2; do NOT use Pydantic v1 |
| SQLAlchemy 2.0+ | asyncpg 0.30+ | Use `create_async_engine("postgresql+asyncpg://...")` |
| Alembic 1.14+ | SQLAlchemy 2.0+ | Alembic env.py must use `run_async` for async migrations |
| python-jose 3.3+ | cryptography 43+ | Use `[cryptography]` extra, not `[pycryptodome]` |
| Uvicorn 0.32+ | Python 3.12+ | Use `uvicorn[standard]` for lifespan and reload support |

## Sources

- FastAPI official docs — verified async patterns, WebSocket, dependency injection
- SQLAlchemy 2.0 docs — verified AsyncSession, create_async_engine API
- Web search — FastAPI production architecture best practices 2025
- Web search — AI surveillance platform architecture patterns
- Web search — FastAPI fault tolerance and circuit breaker patterns

---
*Stack research for: AI-Powered Public Safety Surveillance Backend*
*Researched: 2026-05-31*
