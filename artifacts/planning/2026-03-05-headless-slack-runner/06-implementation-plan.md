# Headless Slack Workflow Runner - Implementation Plan

**Date:** 2026-03-05
**Priority:** HIGH
**Status:** Planning
**Estimated Effort:** 5–7h agentic + 1h review

---

## Overview

### Problem Statement

The headless Slack workflow runner PoC functions correctly for protocol handshakes, checkpoint bridging, and git worktree isolation, but lacks the operational qualities needed for merge: sessions are lost on restart (in-memory Map only), logging is unstructured console output with no file persistence, and crash recovery leaves orphaned worktrees and agent processes. These gaps make the runner unsuitable for real workflow execution where restarts, diagnostics, and resource cleanup are expected.

### Scope

**In Scope:**
- State persistence via SQLite (`node:sqlite` DatabaseSync)
- Structured JSON logging with daily file rotation (pino + pino-roll)
- Graceful shutdown with active session cleanup
- Startup worktree sweep for orphan recovery
- stderr handling downgrade (false-positive elimination)
- `npm run runner` script entry
- Live validation (post-implementation, merge gate)

**Out of Scope:**
- Unit tests for SessionManager or SlackBot (high mocking overhead, PoC scope)
- Error recovery / automatic agent restart (follow-up work package)
- Multi-repo or multi-user support (deferred)
- Slack App setup documentation (deferred)

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Research:** [04-research.md](04-research.md) — SQLite options, pino+pino-roll, ACP protocol validation, crash handling
- **Implementation Analysis:** [05-implementation-analysis.md](05-implementation-analysis.md) — gap analysis, baselines, success criteria

### Key Findings Summary

**From Research:**
- `node:sqlite` DatabaseSync: zero dependencies, native ESM, synchronous API appropriate for single-user session state
- pino + pino-roll: fastest Node.js JSON logger with daily rotation and count-based retention
- ACP assumptions #2 and #3 verified; #1 (`cursor/ask_question` params) unverifiable without live test

**From Implementation Analysis:**
- **Baseline:** 1,120 LOC, 7 modules, 8 console.* calls, 0 persistence, 19 passing tests
- **Gaps:** 7 identified (G1–G7), categorized as quick wins, structural improvements, and post-implementation
- **Architecture:** Layered event-driven; SessionManager is the central orchestrator with 4 internal dependencies

---

## Proposed Approach

### Solution Design

Address all 7 gaps in dependency order: quick wins first (eliminating noise and adding scripts), then structural improvements (logging infrastructure before persistence, since persistence should log from the start), then startup recovery (which benefits from both logging and persistence context). Live validation is the final gate.

Each task is designed to be independently committable and testable via manual verification or existing test suite.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Logging first, then persistence | Persistence code has logging from day one; cleaner debugging | Slight effort overlap with stderr fix | **Selected** |
| Persistence first, then logging | Persistence is higher priority gap | Persistence debugging without structured logs | Rejected |
| Combined logging + persistence task | Fewer commits | Too large for single review; harder to bisect | Rejected |
| `better-sqlite3` instead of `node:sqlite` | ~1.5x faster | No native ESM, requires node-gyp; ESM PR closed | Rejected |
| winston instead of pino | Built-in rotation | Slower, heavier, overkill for dev tooling | Rejected |

---

## Implementation Tasks

### Task 1: Downgrade stderr handling (G4) — 10–15 min

**Goal:** Eliminate false-positive error noise from Cursor CLI diagnostic output on stderr.

**Gap:** G4 | **Requirement:** REQ-SC-2 | **Priority:** LOW

**What changes:**
- `src/runner/acp-client.ts` (lines 133–136): Replace `this.emit('error', new Error(...))` with `this.emit('stderr', text)`. The consuming code in `session-manager.ts` already has an error handler that only logs — this change separates true process errors from diagnostic stderr output. The stderr event will be picked up by logging in Task 4.

**Dependencies:** None (leaf change)

**Deliverables:**
- `src/runner/acp-client.ts` — stderr emits `stderr` event instead of `error`
- `src/runner/session-manager.ts` — wire `stderr` event to console/log output (will become pino in Task 4)

**Verification:** Existing acp-client tests pass. No behavioral change to error/close handling.

---

### Task 2: Add `npm run runner` script (G6) — 5 min

**Goal:** Enable runner startup via `npm run runner` per deployment documentation.

**Gap:** G6 | **Requirement:** REQ-DO-2 | **Priority:** LOW

**What changes:**
- `package.json`: Add `"runner": "tsx src/runner/index.ts"` to the `scripts` object.

**Dependencies:** None

**Deliverables:**
- `package.json` — runner script entry

**Verification:** `npm run runner` starts the runner process (requires env vars).

---

### Task 3: Add shutdown session cleanup (G5) — 30–45 min

**Goal:** Clean up all active ACP processes and worktrees on graceful runner shutdown (SIGINT/SIGTERM).

**Gap:** G5 | **Requirement:** REQ-SC-2 | **Priority:** MEDIUM

**What changes:**
- `src/runner/session-manager.ts`: Add `shutdownAll(): Promise<void>` method that iterates the sessions Map, calls `cleanupSession()` on each active session (status not `completed` or `error`), and clears both Maps.
- `src/runner/index.ts`: Call `sessionManager.shutdownAll()` in the shutdown handler before `app.stop()`.

**Dependencies:** None (but logically follows G4 since error/stderr handling is cleaner)

**Deliverables:**
- `src/runner/session-manager.ts` — `shutdownAll()` method
- `src/runner/index.ts` — updated shutdown handler

**Verification:** Start runner, start a workflow, send SIGTERM — agent process killed, worktree removed.

---

### Task 4: Structured logging with rotation (G2) — 1.5–2h

**Goal:** Replace all console.* calls with pino structured JSON logger with daily file rotation.

**Gap:** G2 | **Requirement:** REQ-SB-2 | **Priority:** HIGH

**What changes:**
- `package.json`: Add `pino` and `pino-roll` dependencies.
- `src/runner/logger.ts` (new file): Create and export a pino logger instance configured with pino-roll transport (daily rotation, 14-file retention, `logs/runner` path). Export a `createChildLogger(context)` helper.
- `src/runner/index.ts`: Replace 4 console.* calls with logger calls. Add `LOG_LEVEL` env var support.
- `src/runner/session-manager.ts`: Replace 3 console.* calls with child logger (`logger.child({ sessionId })`). Wire the `stderr` event from Task 1 to `logger.debug()`.
- `src/runner/slack-bot.ts`: Replace 1 console.warn call with logger.warn.
- `src/runner/config.ts`: Add optional `LOG_LEVEL` to config schema.
- `.gitignore`: Add `logs/` directory.

**Dependencies:** Task 1 (stderr event wiring)

**Deliverables:**
- `src/runner/logger.ts` — new logger module
- `src/runner/index.ts` — logger integration
- `src/runner/session-manager.ts` — child logger with session context
- `src/runner/slack-bot.ts` — logger integration
- `src/runner/config.ts` — LOG_LEVEL config
- `package.json` — pino, pino-roll deps
- `.gitignore` — logs/ exclusion

**Verification:** Start runner, verify JSON output in `logs/` directory. Verify log entries include structured fields (level, time, msg, sessionId where applicable).

---

### Task 5: SQLite state persistence (G1) — 2.5–3h

**Goal:** Persist session state to SQLite so sessions survive runner restarts.

**Gap:** G1 | **Requirement:** REQ-SB-1 | **Priority:** HIGH

**What changes:**
- `src/runner/session-store.ts` (new file): `SessionStore` class wrapping `node:sqlite` `DatabaseSync`. Methods: `open(dbPath)`, `save(session)`, `load(id)`, `loadActive()`, `updateStatus(id, status, error?)`, `close()`. Schema from research (sessions table with id, workflow_id, target_submodule, issue_ref, slack_channel, slack_thread_ts, status, worktree_path, created_at, completed_at, error).
- `src/runner/session-manager.ts`: Accept `SessionStore` in constructor. Call `store.save()` on session creation. Call `store.updateStatus()` on status transitions (running, awaiting_checkpoint, completed, error). Load active sessions on startup via `store.loadActive()` for recovery awareness (logged, not re-attached — re-attachment is out of scope).
- `src/runner/index.ts`: Create `SessionStore`, open database (`data/runner.db`), pass to `SessionManager`. Close store on shutdown.
- `src/runner/config.ts`: Add optional `DB_PATH` to config schema (default: `data/runner.db`).
- `.gitignore`: Add `data/` directory.

**Dependencies:** Task 4 (logging — persistence operations should log)

**Deliverables:**
- `src/runner/session-store.ts` — new persistence module
- `src/runner/session-manager.ts` — store integration
- `src/runner/index.ts` — store lifecycle
- `src/runner/config.ts` — DB_PATH config
- `.gitignore` — data/ exclusion

**Verification:** Start workflow, stop runner, restart — verify session record exists in SQLite. Query with `sqlite3 data/runner.db "SELECT * FROM sessions;"`.

---

### Task 6: Startup worktree sweep + prefix rename (G3) — 45–60 min

**Goal:** Detect and remove orphaned worktrees from previous runner crashes on startup. Also rename the worktree directory prefix from `run-` to `wf-runner-` for safety (reconciliation finding #25).

**Gap:** G3 | **Requirement:** REQ-SC-2 | **Priority:** MEDIUM

**What changes:**
- `src/runner/worktree-manager.ts`:
  - Rename worktree directory prefix from `run-${runId}` to `wf-runner-${runId}` (line 56) for distinctiveness. Update branch prefix from `runner/` to `wf-runner/` (line 57) for consistency.
  - Add `sweepOrphaned(): Promise<number>` method that runs `git worktree list --porcelain`, filters for `wf-runner-` prefix in the worktree path, and removes them via `git worktree remove --force`. Returns count of swept worktrees.
- `src/runner/index.ts`: Call `worktreeManager.sweepOrphaned()` during startup, after store initialization. Log results.
- `tests/runner/worktree-manager.test.ts`: Update existing tests if they assert on the `run-` prefix.

**Dependencies:** Task 4 (logging), Task 5 (store — can cross-reference active sessions to avoid removing in-use worktrees, though prefix matching is the primary mechanism)

**Deliverables:**
- `src/runner/worktree-manager.ts` — prefix rename + `sweepOrphaned()` method
- `src/runner/index.ts` — startup sweep call
- `tests/runner/worktree-manager.test.ts` — updated prefix assertions

**Verification:** Create a manual worktree with `wf-runner-` prefix, start runner — verify it is removed. Verify non-prefixed worktrees are untouched.

---

### Task 7: Live validation (G7) — Post-implementation

**Goal:** Execute one complete workflow end-to-end via Slack + Cursor ACP, including checkpoint interaction.

**Gap:** G7 | **Requirement:** REQ-MC-1 | **Priority:** HIGH (merge gate)

**What changes:** No code changes — validation exercise.

**Dependencies:** All prior tasks (1–6)

**Procedure:**
1. Start runner: `npm run runner`
2. In Slack: `/workflow start work-package midnight-node`
3. Observe: worktree creation, agent spawn, status streaming to thread
4. Interact: respond to at least one checkpoint via Slack buttons
5. Verify: workflow completes or errors gracefully
6. Verify: session persisted in SQLite
7. Verify: structured log entries in `logs/`
8. Document: record ACP assumption #1 verification result

**Deliverables:**
- ACP assumption #1 resolved (verified or corrected)
- Validation evidence documented

---

## Task Dependency Graph

```
T1 (stderr)  T2 (script)
    │              │
    └──────┬───────┘
           │
     T3 (shutdown)
           │
     T4 (logging) ← depends on T1
           │
     T5 (persistence) ← depends on T4
           │
     T6 (worktree sweep) ← depends on T4, T5
           │
     T7 (live validation) ← depends on all
```

**Critical path:** T1 → T4 → T5 → T6 → T7

Tasks T1, T2, and T3 can proceed in parallel at the start. T3 does not strictly depend on T1 but benefits from having cleaner error semantics. T4 depends on T1 (stderr wiring). T5 depends on T4 (should have logging). T6 depends on T5 (cross-reference with store) and T4 (logging). T7 gates merge.

---

## Success Criteria

*Based on baseline metrics and gap analysis*

### Functional Requirements
- [ ] Sessions persist in SQLite and survive runner restart (G1 → REQ-SB-1)
- [ ] All console.* replaced with pino structured JSON output (G2 → REQ-SB-2)
- [ ] Log files rotate daily with 14-file retention (G2 → REQ-SB-2)
- [ ] Orphaned worktrees swept on startup (G3 → REQ-SC-2)
- [ ] stderr logged at debug level, not emitted as errors (G4 → REQ-SC-2)
- [ ] Active sessions cleaned up on SIGINT/SIGTERM (G5 → REQ-SC-2)
- [ ] Runner starts via `npm run runner` (G6 → REQ-DO-2)
- [ ] One complete workflow run via Slack + Cursor ACP (G7 → REQ-MC-1)

### Quality Requirements
- [ ] Existing 19 tests remain passing
- [ ] No new runtime dependencies beyond pino, pino-roll
- [ ] Each task independently committable

### Measurement Strategy
- **Persistence:** Start workflow → `kill -15` runner → restart → `sqlite3 data/runner.db "SELECT * FROM sessions;"`
- **Logging:** Inspect `logs/` for JSON entries with level, time, msg, sessionId fields
- **Crash handling:** Start workflow → `kill -9` runner → restart → verify worktree sweep log
- **Live validation:** `/workflow start work-package midnight-node` → observe full lifecycle in Slack thread

---

## Dependencies & Risks

### Requires (Blockers)
- [ ] Node.js >= 22.5.0 on execution host (for `node:sqlite`) — target runs 24.2.0
- [ ] Slack App configured with Bot Token, App-Level Token, slash command, interactivity
- [ ] Cursor CLI (`agent` binary) available on PATH
- [ ] `CURSOR_API_KEY` environment variable set

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| `cursor/ask_question` params differ from PoC model | MEDIUM | MEDIUM | Live validation is merge gate; format mismatch produces immediate visible error, fixable in checkpoint bridge |
| `node:sqlite` API changes before Node.js stable release | LOW | LOW | Pin Node.js version; API is RC-stable since v22.13.0 |
| pino-roll rotation edge cases (daylight saving, midnight boundary) | LOW | LOW | 14-file retention provides buffer; manual inspection during validation |
| Shutdown cleanup races with active ACP completion | MEDIUM | LOW | Use Promise.allSettled for parallel cleanup; guard against double-cleanup |

---

**Status:** Ready for review
