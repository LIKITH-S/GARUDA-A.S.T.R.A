# Codebase Structure

**Analysis Date:** 2026-06-10

## Directory Layout

```
services/ai/
├── .planning/           # Project planning and tracking documentation
│   └── codebase/       # Codebase mapping and architectural summaries
├── core/                # Core Python services for AI operations
│   ├── deepface_service.py
│   ├── embedding_service.py
│   ├── evaluation_service.py
│   ├── ranking_service.py
│   └── similarity_service.py
├── __init__.py         # Package initialization
└── README.md           # Subsystem overview documentation
```

## Directory Purposes

**.planning/codebase/**
- Purpose: Stores codebase analysis reports, helping the agent understand the current architecture, technologies, conventions, and known concerns.
- Contains: `STACK.md`, `INTEGRATIONS.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `CONCERNS.md`.
- Key files: `ARCHITECTURE.md` (System design patterns), `STACK.md` (Tech stack).

**core/**
- Purpose: Houses the actual AI computation logic and service modules.
- Contains: `*.py` files implementing the face embedding, similarity, and ranking logic.
- Key files:
  - `deepface_service.py` - Pre-loads and configures DeepFace models.
  - `embedding_service.py` - Runs DeepFace inference to produce 512-dim face vector.
  - `ranking_service.py` - Computes and ranks cosine similarities against candidate lists.

## Key File Locations

**Entry Points:**
- `core/deepface_service.py` -> `initialize_deepface()` - Startup model pre-loader.
- `core/embedding_service.py` -> `generate_embedding()` - Primary entry point to get face embeddings.

**Configuration:**
- `core/deepface_service.py` -> `DeepFaceConfig` class - Central configuration for the DeepFace library parameters.

**Core Logic:**
- `core/similarity_service.py` -> `calculate_cosine_similarity()` - Cosine similarity distance calculator.
- `core/ranking_service.py` -> `rank_matches()` / `get_best_match()` - Search ranking pipeline.
- `core/evaluation_service.py` -> `evaluate_confidence()` - Qualifies matches into High/Medium/Low tiers.

## Naming Conventions

**Files:**
- Snake-case for all source files (`deepface_service.py`, `embedding_service.py`).
- Uppercase `.md` for documents (`README.md`, `STACK.md`).

**Directories:**
- Kebab-case/lowercase for directories (`core`, `.planning`, `codebase`).

## Where to Add New Code

**New AI Model Support:**
- Add settings to the `DeepFaceConfig` class in `core/deepface_service.py`.
- Ensure it loads correctly in `initialize_deepface()`.

**New Distance Metrics:**
- Add helper functions to `core/similarity_service.py` (e.g. Euclidean or L2 distance).
- Update `core/ranking_service.py` to support selecting the new metric.

**Testing:**
- Colocated tests (if added) should follow `test_*.py` or `*_test.py` naming and live alongside the files in `core/` or in a new `tests/` directory under `services/ai/`.

---

*Structure analysis: 2026-06-10*
*Update when directory structure changes*
