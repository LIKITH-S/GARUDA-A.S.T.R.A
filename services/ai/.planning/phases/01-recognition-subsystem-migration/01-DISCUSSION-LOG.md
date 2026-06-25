# Phase 1: Recognition Subsystem Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-10
**Phase:** 01-recognition-subsystem-migration
**Areas discussed:** Clean Up Old Core Folder

---

## Clean Up Old Core Folder

| Option | Description | Selected |
|--------|-------------|----------|
| Delete old core/ folder | Delete old core/ folder completely after migrating files to recognition/ | ✓ |
| Keep old core/ but empty it | Keep old core/ folder but empty it (keep structure empty or stubbed) | |
| Keep old core/ with duplicates | Keep old core/ folder with duplicate copies of all files for safety | |

**User's choice:** Delete old core/ folder completely after migrating files to recognition/
**Notes:** Recommending deleting `core/` completely to ensure there is no duplicate module definition in the workspace, which could cause namespace issues and import resolution conflicts.

---

## the agent's Discretion

- Import reference style: Using absolute imports (`from services.ai.recognition.[module] import [function]`) to align with the rest of the backend codebase layout.

## Deferred Ideas

- None — discussion stayed within phase scope.
