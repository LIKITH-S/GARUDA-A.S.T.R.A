# Pitfalls Research

**Domain:** AI-Powered Public Safety Surveillance Backend
**Researched:** 2026-05-31
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Synchronous Database Calls in Async Handlers

**What goes wrong:**
Using synchronous SQLAlchemy sessions (`Session`) or synchronous drivers (`psycopg2`) in async FastAPI handlers. One slow query blocks the entire event loop, causing all concurrent WebSocket connections to hang and all API requests to timeout.

**Why it happens:**
Most SQLAlchemy tutorials still show synchronous patterns. Copy-paste from StackOverflow yields sync code. The sync API works fine in testing but catastrophically fails under concurrent load.

**How to avoid:**
- Use `AsyncSession` and `create_async_engine` exclusively
- Use `asyncpg` driver (not `psycopg2`)
- Lint for any import of `sqlalchemy.orm.Session` (should be `sqlalchemy.ext.asyncio.AsyncSession`)
- Load-test with concurrent WebSocket connections early

**Warning signs:**
- WebSocket connections randomly dropping under load
- API response times increasing non-linearly with concurrency
- "Event loop blocked" warnings in logs

**Phase to address:** Phase 1 (Database Foundation)

---

### Pitfall 2: AI Engine as Hard Dependency

**What goes wrong:**
Backend-api makes synchronous or unprotected calls to ai-engine. When ai-engine crashes, goes offline, or hangs, the entire backend freezes — operators can't view existing alerts, manage incidents, or dispatch officers.

**Why it happens:**
During development, AI engine is always running locally. Developers don't test the "AI offline" path. Service calls don't have timeouts or circuit breakers.

**How to avoid:**
- Wrap ALL ai-engine calls in circuit breaker (pybreaker)
- Set strict HTTP timeouts (5 seconds max)
- Cache last-known AI health status in backend
- Frontend must handle "AI offline" state gracefully (show cached data, disable AI-specific buttons)
- Test backend with AI engine stopped as part of regular testing

**Warning signs:**
- No error handling around httpx calls to AI engine
- No circuit breaker or timeout configuration
- Backend health endpoint calls AI engine synchronously
- No "AI offline" UI state in dashboard

**Phase to address:** Phase 2 (Core API + Fault Tolerance)

---

### Pitfall 3: WebSocket Memory Leaks from Stale Connections

**What goes wrong:**
Clients disconnect without sending a close frame (browser tab crash, mobile app backgrounded, network loss). Server-side connection objects accumulate in the ConnectionManager, consuming memory. After days of operation, backend OOM-kills.

**Why it happens:**
WebSocket disconnect isn't always signaled cleanly. Default FastAPI WebSocket handlers don't implement heartbeats. ConnectionManager stores connections in a list/dict but never cleans stale entries.

**How to avoid:**
- Implement ping/pong heartbeat (every 30 seconds)
- Set connection timeout (disconnect if no pong in 60 seconds)
- Wrap all sends in try/except — if send fails, remove connection immediately
- Log connection count periodically; alert if growing unbounded
- Use `weakref` or explicit cleanup in ConnectionManager

**Warning signs:**
- Connection count grows monotonically (never decreases)
- Memory usage grows over time
- "send failed" errors appearing in logs without corresponding cleanup

**Phase to address:** Phase 3 (Real-Time System)

---

### Pitfall 4: Missing Database Indexes on Query-Heavy Columns

**What goes wrong:**
Alert queries by `status`, `created_at`, `camera_id` are fast with 100 rows but become painfully slow with 100,000+ rows. Dashboard page loads go from 200ms to 5+ seconds. Operators complain about "slow system."

**Why it happens:**
ORMs abstract away SQL, making it easy to forget about indexes. Developers test with small datasets. SQLAlchemy model definitions don't require indexes.

**How to avoid:**
- Add indexes on every column used in WHERE, ORDER BY, or JOIN
- Specifically: `alerts.status`, `alerts.created_at`, `detection_events.timestamp`, `incidents.status`, `assignments.officer_id`
- Composite indexes for common query patterns: `(status, created_at)` for filtered+sorted alert lists
- Use `EXPLAIN ANALYZE` on critical queries during development

**Warning signs:**
- Sequential scans on tables with 10k+ rows
- Query times > 100ms for simple lookups
- Dashboard refresh taking multiple seconds

**Phase to address:** Phase 1 (Database Foundation)

---

### Pitfall 5: Leaking Internal Data Through API Responses

**What goes wrong:**
SQLAlchemy models returned directly as API responses expose password hashes, internal IDs, audit fields, and relationship data that clients shouldn't see. Patrol officers see admin-only fields.

**Why it happens:**
FastAPI's auto-serialization makes it tempting to return ORM objects directly. During rapid development, response schemas are skipped. Role-based response filtering isn't implemented.

**How to avoid:**
- Never return ORM models directly — always use Pydantic response schemas
- Create role-specific response schemas when needed (e.g., `UserResponseAdmin` vs `UserResponsePublic`)
- Exclude sensitive fields explicitly: `password_hash`, `refresh_token`, internal foreign keys
- Use `response_model` on every endpoint

**Warning signs:**
- Endpoints without `response_model` parameter
- Response JSON containing `password_hash`, `__dict__`, or unexpected fields
- No Pydantic schema files in `schemas/` directory

**Phase to address:** Phase 2 (Core API)

---

### Pitfall 6: JWT Tokens Without Proper Expiry and Refresh

**What goes wrong:**
Long-lived JWT tokens (24h+) mean a compromised token gives extended access. No refresh token means users must re-login frequently. Revocation isn't possible with stateless JWTs.

**Why it happens:**
JWT tutorials show simple token generation without refresh flow. Developers set long expiry to avoid re-login during testing.

**How to avoid:**
- Access token: 15-30 minute expiry
- Refresh token: 7-day expiry, stored in database (revocable)
- Token refresh endpoint: exchange valid refresh token for new access token
- Logout: blacklist refresh token in database
- Store refresh tokens with `user_id`, `expires_at`, `is_revoked` columns

**Warning signs:**
- Access token expiry > 1 hour
- No refresh token implementation
- No token revocation mechanism
- Logout doesn't invalidate any tokens

**Phase to address:** Phase 2 (Authentication)

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping Alembic migrations, using `create_all()` | Faster iteration | No rollback path, impossible schema evolution | Never in production; acceptable only in throwaway prototypes |
| Single `main.py` with all routes | Faster initial development | Unmaintainable after 500+ lines, merge conflicts | Never — modular structure from day 1 |
| Local file storage for evidence | No cloud infra needed | Not scalable, no redundancy, lost on server failure | Acceptable for v1 dev, but design for swappable storage backend |
| Hardcoded CORS origins | Works immediately | Security hole in production | Only in development; use env-based config |
| No rate limiting | Simpler API | DoS vulnerability, abuse potential | Acceptable for v1 internal tool, add before any external exposure |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Frontend → Backend WebSocket | Not handling reconnection on network interruption | Client-side reconnect with exponential backoff + jitter; resume from last event ID |
| Backend → AI Engine health | Polling every second, overwhelming AI engine | Poll every 30 seconds; cache result; use circuit breaker for immediate failover |
| Mobile → Backend auth | Storing JWT in AsyncStorage without encryption | Use secure storage (Expo SecureStore); refresh token rotation on each use |
| Alembic → Async SQLAlchemy | Using sync engine in `env.py` | Must configure `run_async()` in Alembic env.py for async engine compatibility |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries on incident list with assignments | Each incident triggers a query for its assignments | Use `selectinload(Incident.assignments)` on list queries | >50 incidents per page |
| Unpartitioned detection_events table | Full table scan for time-range queries | Partition by month on `timestamp` column | >1M detection events |
| Broadcasting to all WebSocket clients on every event | CPU spike on high-frequency detection events | Batch broadcasts (debounce 100ms); topic-based filtering | >10 events/second |
| Loading full evidence files into memory | OOM on large file uploads | Stream uploads to disk with `aiofiles`; never load full file into memory | >100MB files |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| JWT secret in source code | Token forgery — anyone with the code can create valid admin tokens | Use environment variable `JWT_SECRET_KEY`; rotate every deployment |
| No RBAC on WebSocket channels | Patrol officers see admin-only system health data | Validate role on WebSocket connection; filter broadcast by user role |
| SQL injection via raw queries | Full database compromise | Never use f-strings in SQL; always use SQLAlchemy parameterized queries |
| Evidence files served without auth | Unauthorized access to surveillance evidence | Serve evidence through authenticated API endpoint, not static files |
| No audit log for auth events | Failed login attempts invisible; breach detection impossible | Log all login attempts (success/failure) with IP, user agent, timestamp |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Alert notification without sound/vibration on mobile | Officers miss critical alerts in noisy environments | Push notifications with distinct sound; vibration pattern for high-priority |
| Stale dashboard data without visible "last updated" | Operators make decisions on outdated information | Show "Last updated: X seconds ago" with color-coded freshness indicator |
| No confirmation on critical actions (resolve alert, close incident) | Accidental actions on active operations | Confirmation dialog for destructive/irreversible actions |
| Paginating alerts with "Load More" instead of real-time insert | New critical alerts buried under old ones | New alerts prepend to list in real-time via WebSocket; highlight new items |

## "Looks Done But Isn't" Checklist

- [ ] **Auth:** Token refresh working — verify expired access token + valid refresh token = new access token
- [ ] **WebSocket:** Reconnection working — verify killing server and restarting reconnects all clients
- [ ] **Alerts:** Real-time delivery working — verify alert created via API appears on dashboard within 1 second
- [ ] **Incidents:** Status transitions enforced — verify can't go from Closed to Open without re-opening flow
- [ ] **Missing Persons:** Image upload working — verify uploaded image persists and is retrievable
- [ ] **Officer Assignment:** Status tracking working — verify assignment status updates appear on Response Board in real-time
- [ ] **AI Offline:** Graceful degradation working — verify stopping AI engine shows "AI Offline" on dashboard without errors
- [ ] **Pagination:** Working with filters — verify filtering + sorting + pagination work together (not just individually)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sync database calls deployed | MEDIUM | Replace sync sessions with AsyncSession; requires touching all service files |
| No indexes on large tables | LOW | Add indexes via Alembic migration; brief lock during creation |
| WebSocket memory leak in production | HIGH | Restart service (brief outage); implement heartbeat; deploy fix |
| JWT tokens with no expiry deployed | MEDIUM | Rotate JWT secret (forces all re-login); implement proper expiry |
| AI engine coupling causing cascading failures | HIGH | Implement circuit breaker; requires architectural refactor of all AI calls |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Sync database calls | Phase 1 (DB Foundation) | All imports use AsyncSession; load test with 50 concurrent requests |
| AI engine hard dependency | Phase 2 (Core API) | Stop AI engine; verify all non-AI endpoints still work |
| WebSocket memory leaks | Phase 3 (Real-Time) | Run 24-hour soak test; verify connection count stabilizes |
| Missing indexes | Phase 1 (DB Foundation) | `EXPLAIN ANALYZE` on top 5 queries; no sequential scans |
| Leaking internal data | Phase 2 (Core API) | Response schema audit; no password_hash in any response |
| JWT expiry issues | Phase 2 (Auth) | Automated test: token expires after configured time |

## Sources

- FastAPI production deployment post-mortems
- OWASP API Security Top 10 (2023)
- SQLAlchemy async migration guide
- WebSocket scaling patterns (Real-time web applications)
- Public safety system reliability requirements (CJIS)

---
*Pitfalls research for: AI-Powered Public Safety Surveillance Backend*
*Researched: 2026-05-31*
