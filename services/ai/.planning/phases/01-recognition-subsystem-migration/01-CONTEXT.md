# Phase 1: Recognition Subsystem Migration - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the migration and refactoring of the recognition components of the AI system from the old `core/` folder to a new decoupled `recognition/` folder. It resolves namespace and import references across all affected files (including FastAPI backend endpoints) and verifies that embedding, similarity, and ranking logic work correctly without duplication.

</domain>

<decisions>
## Implementation Decisions

### Folder Relocation
- **D-01:** Migrate all recognition modules (`deepface_service.py`, `embedding_service.py`, `similarity_service.py`, `ranking_service.py`, `evaluation_service.py`) to `services/ai/recognition/`.
- **D-02:** Delete the old `services/ai/core/` folder completely post-migration to prevent duplicate module definitions, IDE indexing confusion, and import errors.

### Import References
- **D-03:** Update all internal and external import statements to use absolute path naming convention: `from services.ai.recognition.[module] import [function]`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Requirements
- `.planning/PROJECT.md` — Project context and Phase 1 target requirements.
- `.planning/REQUIREMENTS.md` — Detailed v1 requirements for the RECG-xx series.

### Codebase Organization
- `.planning/codebase/STRUCTURE.md` — Original codebase layout and file purposes.
- `.planning/codebase/CONVENTIONS.md` — Original Python naming and import block order standards.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `services/ai/core/deepface_service.py` - Core ArcFace builder settings.
- `services/ai/core/embedding_service.py` - Generates 512-dim embedding using temp file logic.
- `services/ai/core/similarity_service.py` - Cosine calculations via scipy.
- `services/ai/core/ranking_service.py` - List scanner for database matching.
- `services/ai/core/evaluation_service.py` - Qualifies similarity scores into High/Medium/Low tiers.

### Integration Points
- `services/backend/api/v1/endpoints/ai_events.py` — Ingests single-image uploads, calls the embedding and ranking modules.
- `services/backend/api/v1/endpoints/missing_persons.py` — Ingests missing person uploads to create face embeddings.

</code_context>

<specifics>
## Specific Ideas

- The functionality and logic of the recognition modules themselves must not be changed (as it is managed by the Recognition developer). We are only moving the files and updating imports.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-recognition-subsystem-migration*
*Context gathered: 2026-06-10*
