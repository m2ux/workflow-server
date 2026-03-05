# Test Suite Review: Headless Slack Workflow Runner

**Branch:** `feat/headless-slack-runner`  
**Test framework:** Vitest  
**Test files:** 3 (`tests/runner/`)  
**Reviewer:** AI agent (post-impl-review activity)

---

## Coverage Overview

| Source Module | LOC | Test File | Test LOC | Verdict |
|---------------|----:|-----------|--------:|---------|
| `acp-client.ts` | 319 | `acp-client.test.ts` | 170 | Adequate |
| `checkpoint-bridge.ts` | 141 | `checkpoint-bridge.test.ts` | 123 | Good |
| `worktree-manager.ts` | 154 | `worktree-manager.test.ts` | 108 | Adequate |
| `session-manager.ts` | 349 | — | — | **Missing** |
| `session-store.ts` | 102 | — | — | **Missing** |
| `slack-bot.ts` | 142 | — | — | **Missing** |
| `config.ts` | 73 | — | — | **Missing** |
| `logger.ts` | 20 | — | — | Acceptable (trivial) |
| `index.ts` | 49 | — | — | Acceptable (composition root) |

**Overall:** 3 of 7 non-trivial modules have tests. The three tested modules cover the lower-level building blocks (transport, bridge, worktree), but the higher-level orchestration layer (`session-manager`, `slack-bot`) and persistence (`session-store`) are untested.

---

## Test Quality Assessment

### Strengths

1. **Clean mock patterns** — Tests use `vi.mock()` for system modules (`node:child_process`, `node:fs/promises`) and `vi.fn()` for interface stubs. Mocks are properly reset in `beforeEach`.

2. **Both happy path and error conditions covered** — `acp-client.test.ts` tests process exit rejection; `checkpoint-bridge.test.ts` tests unknown action IDs and missing checkpoints.

3. **Clear test naming** — Test descriptions accurately state expected behavior (e.g., "should reject pending promises when process closes").

4. **Realistic test data** — `SAMPLE_CHECKPOINT` in the bridge tests mirrors actual ACP checkpoint structure.

### Concerns

**T1. Heavy reliance on private member access via `as any`** (Medium)  
`tests/runner/acp-client.test.ts:26–36`

The `injectMockProcess` helper accesses `(client as any).process`, `(client as any).handleLine`, and `(client as any).rejectAllPending`. This couples tests to internal implementation — renaming a private method breaks tests without changing behavior.

*Recommendation:* Consider exposing a `spawn` override mechanism (e.g., dependency injection for the process factory) or testing through the public `spawn()` method with a mocked `child_process.spawn`.

**T2. Timing-dependent `tick()` helper** (Medium)  
`tests/runner/acp-client.test.ts:50`

`const tick = () => new Promise((r) => setTimeout(r, 10))` relies on a 10ms delay being sufficient for readline to process pushed data. This could be flaky in resource-constrained CI environments.

*Recommendation:* Use `vi.useFakeTimers()` or `setImmediate`-based flush to avoid real-time dependencies.

**T3. `worktree-manager.test.ts` mocks `execFile` with callback API** (Low)  
`tests/runner/worktree-manager.test.ts:6–10, 26–31`

The mock intercepts `execFile` at the callback level, but the source uses `promisify(execFile)`. The mock works because promisify wraps the callback, but the pattern is brittle — if the source switched to an alternative async exec, the mock would silently stop intercepting.

---

## Coverage Gaps

### Gap 1: `SessionManager` — No tests (High priority)

This is the most complex module (349 LOC) with the most integration points. Key untested flows:

- `startWorkflow()` end-to-end: worktree creation → ACP spawn → initialization → prompt dispatch
- `wireAcpEvents()`: checkpoint bridging, auto-approve behavior, error propagation
- `handleCompletion()` / `handleError()`: status updates, cleanup sequencing
- `shutdownAll()`: concurrent cleanup of multiple sessions
- Timer lifecycle (`startUpdateTimer` / `stopUpdateTimer` / `flushPendingText`)
- Stale session recovery on construction

### Gap 2: `SessionStore` — No tests (Medium priority)

SQLite operations are untested:
- Schema creation on `open()`
- `save()` / `load()` / `loadActive()` round-trip
- `updateStatus()` with and without error messages
- Behavior when store is not open (`requireDb()` guard)

### Gap 3: `slack-bot.ts` — No tests (Medium priority)

Slash command routing is untested:
- Argument parsing for `/workflow start`
- Missing arguments handling
- Thread creation flow (`say()` returns `ts`)
- Error propagation from `sessionManager.startWorkflow()`

### Gap 4: `config.ts` — No tests (Low priority)

Validation edge cases are untested:
- Missing required env vars
- Invalid token prefixes
- Malformed `MCP_SERVERS_JSON`
- Default values for optional fields

---

## Missing Edge Case Tests

| Module | Missing Edge Case |
|--------|-------------------|
| `acp-client` | Malformed JSON lines (partial JSON, binary data) |
| `acp-client` | Multiple rapid `send()` calls with interleaved responses |
| `acp-client` | `write()` when stdin is not writable (process dying mid-write) |
| `checkpoint-bridge` | Concurrent `resolveCheckpoint` calls for same thread |
| `checkpoint-bridge` | `presentCheckpoint` when Slack API returns error |
| `worktree-manager` | Partial failure in `create()` (submodule init fails after worktree add succeeds) |
| `worktree-manager` | `sweepOrphaned` with a mix of successful and failed removals |

---

## Recommendations

1. **Priority 1:** Add `session-manager.test.ts` covering the core orchestration flows. This module has the highest complexity and the most potential for subtle bugs (async event wiring, timer lifecycle, error cascading).

2. **Priority 2:** Add `session-store.test.ts` with an in-memory or temp-file SQLite database. The `node:sqlite` `DatabaseSync` API is relatively new and warrants verification of the schema migration and query behavior.

3. **Priority 3:** Add `config.test.ts` covering env validation. This is fast to write and catches misconfiguration errors early.

4. **Defer:** `slack-bot.test.ts` can be deferred as it primarily delegates to `SessionManager` and the Bolt framework handles most edge cases.

---

## Verdict

The existing tests are well-written and cover the foundational modules adequately. The primary gap is the absence of tests for `SessionManager`, which is the central orchestration hub. For a PoC, the current coverage is acceptable provided the gaps are tracked as known debt.
