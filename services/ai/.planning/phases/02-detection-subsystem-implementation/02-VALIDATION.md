---
phase: 2
slug: detection-subsystem-implementation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-11
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | unittest (Python Standard Library) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `services\venv\Scripts\python.exe -m unittest services/ai/tests/test_detection.py` |
| **Full suite command** | `services\venv\Scripts\python.exe -m unittest discover -s services/ai/tests` |
| **Estimated runtime** | ~10 seconds (involving Model building) |

---

## Sampling Rate

- **After every task commit:** Run the quick run command
- **After every plan wave:** Run the full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DETC-01 | — | N/A | unit | `services\venv\Scripts\python.exe -m unittest services.ai.tests.test_detection.TestVideoService` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | DETC-02, DETC-06 | — | N/A | unit | `services\venv\Scripts\python.exe -m unittest services.ai.tests.test_detection.TestFrameExtractor` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | DETC-03 | — | N/A | unit | `services\venv\Scripts\python.exe -m unittest services.ai.tests.test_detection.TestFaceDetection` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | DETC-04 | — | N/A | unit | `services\venv\Scripts\python.exe -m unittest services.ai.tests.test_detection.TestFaceCropper` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | DETC-05 | — | N/A | unit | `services\venv\Scripts\python.exe -m unittest services.ai.tests.test_detection.TestPreprocessing` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `services/ai/tests/test_detection.py` — unittest test cases and stubs for all detection capabilities
- [ ] `services/ai/tests/__init__.py` — package marker

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Processing a full physical `.mp4` video | DETC-01 | Requires a sample video file | Ingest a sample `.mp4` file and check that frames are processed without errors. |

*Status: All phase behaviors have automated unit tests but manual smoke validation on a real mp4 is recommended.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-06-11
