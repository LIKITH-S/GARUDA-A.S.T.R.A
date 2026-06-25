# Feature Research

**Domain:** AI-Powered Public Safety Surveillance Backend
**Researched:** 2026-05-31
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features control room operators and patrol officers assume exist. Missing these = platform feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| JWT authentication with role-based access | Officers need secure login; operators need different permissions than admins | MEDIUM | Three roles: Admin, Control Room Operator, Patrol Officer |
| Incident CRUD with timelines | Core workflow — every surveillance event generates incidents | MEDIUM | Must support status transitions: Open → In Progress → Resolved → Closed |
| Alert creation and acknowledgement | Alerts are the primary output of the AI engine; operators must review them | MEDIUM | Alerts link to detections, cameras, and incidents |
| Missing person registry with image upload | Primary use case — face matching against missing person database | MEDIUM | Images stored as evidence, linked to AI embedding pipeline |
| Officer/patrol unit assignment | Dispatch is the action taken on alerts — must track who is assigned where | MEDIUM | Assignment status: Assigned → En Route → On Site → Completed |
| Real-time WebSocket updates | Control room must see alerts instantly, not on page refresh | HIGH | Alert broadcast, incident status changes, system health updates |
| Activity/audit logging | Accountability required for public safety operations | LOW | Every CRUD action logged with user, timestamp, action, entity |
| System health dashboard | Operators need to know if AI/Backend/DB are operational | LOW | Health endpoints polled by frontend every 30s |
| Pagination, filtering, sorting on all lists | Thousands of alerts/incidents over time; must be navigable | MEDIUM | Cursor-based pagination for alerts (time-ordered), offset for others |
| Consistent API error responses | Frontend needs predictable error handling | LOW | Envelope format: `{ success, data, error, meta }` |

### Differentiators (Competitive Advantage)

Features that make GARUDA ASTRA stand out from generic incident management systems.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI event ingestion pipeline | Automated alert generation from camera detections — the core AI-first value | HIGH | Dedicated endpoint receives detection payloads, validates, stores, broadcasts |
| Auto-incident creation from detections | High-confidence detections automatically create incidents without operator action | MEDIUM | Configurable confidence threshold; operator can still override |
| Fault-tolerant AI degradation | Platform continues operating when AI engine goes offline | MEDIUM | Circuit breaker pattern; cached AI health status; clear operator indication |
| Real-time patrol unit telemetry | Battery, ping, health status for each unit | MEDIUM | WebSocket-pushed from mobile app to backend to dashboard |
| Response board (Kanban dispatch) | Drag-and-drop tactical view of unit deployments | LOW (backend) | Backend provides assignment status; frontend handles Kanban UX |
| Mock AI engine with realistic behavior | Full pipeline testable without real AI models | MEDIUM | Simulates detections with configurable frequency, confidence, camera rotation |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time video streaming through backend | "Show camera feeds in dashboard" | Massive bandwidth; backend becomes a proxy; latency kills usefulness | Direct camera→client streaming (RTSP/HLS); backend only stores snapshots/metadata |
| AI model training in the backend | "Train models from the dashboard" | Training requires GPU infrastructure, long-running jobs, different lifecycle | Separate training pipeline; backend only receives trained model artifacts |
| Real-time face recognition in API request | "POST an image, get match result" | Synchronous face matching is slow (100ms-2s); blocks API threads | Async: POST image → receive job ID → poll/WebSocket for result |
| Global broadcast to all units simultaneously | "Send message to every officer" | Notification fatigue; officers ignore bulk alerts | Targeted notifications to relevant zone/assignment; global only for emergencies |
| Unlimited alert history without archival | "Keep everything forever" | Table bloat kills query performance after millions of rows | Time-based partitioning; archive alerts older than 90 days to cold storage |

## Feature Dependencies

```
[JWT Auth]
    └──requires──> [User/Role Models]
                       └──requires──> [Database Schema]

[Alert Management]
    └──requires──> [AI Event Ingestion]
                       └──requires──> [Detection Event Models]
    └──requires──> [WebSocket System]
                       └──requires──> [Connection Manager]

[Incident Management]
    └──requires──> [Alert Management] (alerts can trigger incidents)
    └──requires──> [Officer Assignment] (incidents assigned to officers)
    └──enhances──> [Evidence Management] (evidence linked to incidents)

[Missing Person Reports]
    └──requires──> [File Upload System] (photo evidence)
    └──enhances──> [AI Event Ingestion] (face embeddings from uploaded photos)

[Mock AI Engine]
    └──requires──> [AI Event Ingestion] (must match the ingestion API contract)
    └──requires──> [WebSocket System] (mock events broadcast like real ones)

[System Health]
    └──requires──> [Backend Health Endpoints]
    └──requires──> [AI Engine Health Check] (httpx + circuit breaker)
```

### Dependency Notes

- **Alert Management requires AI Event Ingestion:** Alerts are generated from AI detection events; the ingestion pipeline must exist first
- **Incident Management requires Alert Management:** Incidents can be auto-created from high-confidence alerts
- **Mock AI Engine requires AI Event Ingestion:** Mock engine must produce events that match the real ingestion contract exactly
- **Missing Person Reports enhances AI Event Ingestion:** Uploaded face photos become the comparison database for AI matching

## MVP Definition

### Launch With (v1)

Minimum viable backend — what's needed to make both frontends functional with real data.

- [ ] JWT auth with three roles — unblocks login screen, protected routes
- [ ] Database schema with all core entities — unblocks all CRUD
- [ ] Incident CRUD with status transitions — core operational workflow
- [ ] Alert CRUD with acknowledge/dismiss — primary AI output interface
- [ ] Missing person CRUD with image upload — primary AI input interface
- [ ] Officer management and assignment — dispatch workflow
- [ ] WebSocket connection manager with alert broadcasting — real-time dashboard
- [ ] AI event ingestion endpoint — receives detection payloads
- [ ] Mock AI event generator — simulates real detections
- [ ] System health endpoints — AI/Backend/DB status
- [ ] Activity logging — audit trail for all operations

### Add After Validation (v1.x)

- [ ] Notification preferences per user — when operators request targeted alerts
- [ ] Alert escalation rules — when auto-incident creation needs tuning
- [ ] Evidence chain of custody tracking — when formal evidence handling is required
- [ ] Rate limiting per API key — when exposing APIs beyond internal use

### Future Consideration (v2+)

- [ ] Real AI engine integration (YOLO/ArcFace/FAISS) — after backend pipeline is proven
- [ ] Multi-camera correlation (same person across cameras) — after AI engine exists
- [ ] Predictive patrol routing — after sufficient historical data
- [ ] Public tipline integration — if public-facing features are approved

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| JWT Auth + Roles | HIGH | MEDIUM | P1 |
| Database Schema + Models | HIGH | MEDIUM | P1 |
| Incident Management | HIGH | MEDIUM | P1 |
| Alert Management | HIGH | MEDIUM | P1 |
| Missing Person Reports | HIGH | MEDIUM | P1 |
| WebSocket Broadcasting | HIGH | HIGH | P1 |
| AI Event Ingestion | HIGH | MEDIUM | P1 |
| Mock AI Engine | HIGH | MEDIUM | P1 |
| Officer Assignment | HIGH | MEDIUM | P1 |
| Activity Logging | MEDIUM | LOW | P1 |
| System Health | MEDIUM | LOW | P1 |
| Evidence Management | MEDIUM | MEDIUM | P2 |
| Notification System | MEDIUM | MEDIUM | P2 |
| Frontend Integration | HIGH | HIGH | P1 |

## Competitor Feature Analysis

| Feature | Milestone (India) | Axon (US) | Our Approach |
|---------|-------------------|-----------|--------------|
| Alert management | Manual alerts, no AI auto-generation | AI-assisted with human review | AI auto-generation + operator confirmation loop |
| Dispatch | Phone/radio-based | CAD integration, automated | WebSocket-based real-time with mobile app sync |
| Face recognition | Third-party vendor integration | RealTime Networks partnership | Built-in AI engine (future), mock for now |
| Missing person matching | Database search, manual | Automated with NamUs integration | AI face matching against uploaded database |
| System health | Basic uptime monitoring | Enterprise monitoring suite | Built-in health endpoints with fault isolation |

## Sources

- FastAPI official documentation — WebSocket, dependency injection patterns
- Public safety technology industry reports 2025
- Axon, Milestone, and RealNetworks product documentation
- CISA public safety technology guidelines
- Web search — AI surveillance platform architecture 2025

---
*Feature research for: AI-Powered Public Safety Surveillance Backend*
*Researched: 2026-05-31*
