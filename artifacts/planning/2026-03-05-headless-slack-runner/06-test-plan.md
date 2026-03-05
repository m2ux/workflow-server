# Test Plan: Headless Slack Workflow Runner

**Issue:** [#48](https://github.com/m2ux/workflow-server/issues/48)
**PR:** [#49](https://github.com/m2ux/workflow-server/pull/49)

---

## Overview

This test plan validates the operational hardening of the headless Slack workflow runner: SQLite state persistence, structured logging with rotation, graceful shutdown, startup worktree recovery, and stderr handling. The plan covers both automated tests (unit) and manual validation scenarios (integration, live).

Key changes to validate:
1. `SessionStore` — SQLite-backed session persistence with save/load/update lifecycle
2. Logger module — pino structured logging with pino-roll daily file rotation
3. `SessionManager.shutdownAll()` — graceful cleanup of active sessions on process termination
4. `WorktreeManager.sweepOrphaned()` — startup detection and removal of stale worktrees
5. `AcpClient` stderr handling — diagnostic output separated from error signals

---

## Test Strategy

### Automated Tests (Unit)

New unit tests target the two new modules (`SessionStore`, logger) and the modified behaviors in existing modules. These run in the existing vitest suite alongside the 19 current tests.

**Test infrastructure:**
- `node:sqlite` DatabaseSync with in-memory database (`:memory:`) for store tests — no filesystem side effects
- No mocking framework needed for store tests (pure data layer)
- Existing vitest config and patterns apply

### Manual Tests (Integration / Live)

Shutdown cleanup, startup sweep, log rotation, and the live validation exercise require running the actual runner process. These are documented as manual test procedures with specific verification steps.

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR49-TC-01 | Verify SessionStore creates schema on open | Unit |
| PR49-TC-02 | Verify SessionStore saves and loads a session | Unit |
| PR49-TC-03 | Verify SessionStore.updateStatus transitions status correctly | Unit |
| PR49-TC-04 | Verify SessionStore.loadActive returns only non-terminal sessions | Unit |
| PR49-TC-05 | Verify SessionStore handles missing session gracefully | Unit |
| PR49-TC-06 | Verify stderr event emitted instead of error event on AcpClient | Unit |
| PR49-TC-07 | Verify shutdown cleanup iterates and cleans all active sessions | Manual |
| PR49-TC-08 | Verify startup worktree sweep removes wf-runner-* worktrees | Manual |
| PR49-TC-09 | Verify startup sweep does not remove non-prefixed worktrees | Manual |
| PR49-TC-10 | Verify structured JSON log output in logs/ directory | Manual |
| PR49-TC-11 | Verify runner starts via `npm run runner` | Manual |
| PR49-TC-12 | Verify full workflow end-to-end via Slack + Cursor ACP | Manual |
| PR49-TC-13 | Verify session record persists across runner restart | Manual |
| PR49-TC-14 | Verify ACP assumption #1 (cursor/ask_question params format) | Manual |

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Running Tests

```bash
# Run all unit tests
npx vitest run

# Run only runner tests
npx vitest run tests/runner/

# Run specific test file
npx vitest run tests/runner/session-store.test.ts
```

---

## Acceptance Matrix

| Requirement | Test Cases | Pass Criteria |
|-------------|------------|---------------|
| REQ-SB-1 (SQLite persistence) | PR49-TC-01 through TC-05, TC-13 | All unit tests pass; session survives restart |
| REQ-SB-2 (Structured logging) | PR49-TC-10 | JSON log files present in logs/ with expected fields |
| REQ-SC-2 (Crash handling) | PR49-TC-06, TC-07, TC-08, TC-09 | stderr separated; shutdown cleans up; orphans swept |
| REQ-DO-2 (npm run runner) | PR49-TC-11 | Runner process starts |
| REQ-MC-1 (Live validation) | PR49-TC-12, TC-14 | Full workflow completes; ACP assumption #1 resolved |
