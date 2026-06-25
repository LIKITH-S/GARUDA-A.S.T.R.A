# Testing Patterns

**Analysis Date:** 2026-06-10

## Test Framework

**Runner:**
- No automated unit test runner (such as `pytest`) is currently configured specifically for the `services/ai` subsystem.
- Integration tests are run manually via custom python scripts.

**Run Commands:**
```bash
# To test the API server (and indirectly the AI matching module):
python backend/scripts/test_server.py
```

## Test File Organization

**Location:**
- There are currently no unit test files inside `services/ai/core/`.
- Integration and manual testing scripts reside under the `services/backend/scripts/` directory.

**Structure:**
```
services/
  backend/
    scripts/
      test_server.py       # Async HTTP client testing authentication and health
      mock_ai_engine.py    # Simulates periodic camera face detection triggers
  ai/
    core/
      (no tests currently written here)
```

## Mocking

- No mocking libraries or patterns are set up in the `services/ai` module.
- External systems: The mock engine (`services/backend/scripts/mock_ai_engine.py`) acts as a test driver by simulating edge camera inputs, sending POST requests with images to `/api/v1/ai-events/`.

## Test Types

**Unit Tests:**
- None. (Recommended to add `pytest` tests for `similarity_service.py` and `evaluation_service.py` since they contain pure logic).

**Integration / Manual Verification:**
- Done using the `mock_ai_engine.py` script which loads local images, constructs multipart/form-data requests, and POSTs them to the running FastAPI server.
- The `test_server.py` script tests live endpoints (e.g. login, health).

---

*Testing analysis: 2026-06-10*
*Update when test patterns change*
