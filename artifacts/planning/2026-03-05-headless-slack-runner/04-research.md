# Research Findings - Headless Slack Workflow Runner

**Issue:** #48 — feat: headless Slack workflow runner via Cursor ACP
**Date:** 2026-03-05

---

## 1. SQLite Persistence (REQ-SB-1, REQ-SB-4)

### Requirement
Session state must survive runner restarts. SQLite selected as persistence backend.

### Findings

#### Option A: `node:sqlite` (Built-in Module) — Recommended

- **Availability:** Built into Node.js since v22.5.0; unflagged in v23.4.0 / v22.13.0. The project runs **Node.js 24.2.0**, so it is fully available.
- **Stability:** Stability 1.2 (Release Candidate) as of Node.js 25.7.0. The stabilization effort targets full stability in Node.js 25 (October 2025). See [nodejs/node#57445](https://github.com/nodejs/node/issues/57445).
- **ESM Compatibility:** Native ESM import: `import { DatabaseSync } from 'node:sqlite';`
- **API:** Synchronous (`DatabaseSync`) — `exec()`, `prepare()`, `run()`, `get()`, `all()`. No async API yet.
- **Dependencies:** Zero — ships with Node.js.
- **Trade-offs:** Synchronous API matches the session state use case (quick reads/writes, no concurrent contention at single-user scale). No ORM layer; raw SQL only.

#### Option B: `better-sqlite3`

- **Performance:** Fastest third-party SQLite binding for Node.js (1.1x–1.7x faster than `node:sqlite` in benchmarks). Synchronous API.
- **ESM Compatibility:** **Does not support native ESM**. Requires `createRequire()` workaround. A PR to add ESM was closed in January 2025 due to native binding loader constraints. See [WiseLibs/better-sqlite3#1293](https://github.com/WiseLibs/better-sqlite3/pull/1293).
- **Dependencies:** Native C++ binding — requires node-gyp / prebuild. Adds build complexity.
- **Trade-offs:** Superior performance, but the ESM incompatibility and native dependency add friction in an `"type": "module"` project.

#### Option C: `sql.js`

- **Architecture:** Pure JavaScript (WebAssembly). Async API.
- **ESM Compatibility:** Works with ESM.
- **Trade-offs:** Significantly slower than both alternatives. Designed for browser/Node.js portability — unnecessary for server-only use.

### Recommendation

**Use `node:sqlite`** (`DatabaseSync`). Zero dependencies, native ESM, synchronous API appropriate for the use case, and already available on the target Node.js version. The stability 1.2 designation is acceptable for developer tooling that pins its Node.js version.

### Schema Design

Minimal session state table for persistence:

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  target_submodule TEXT NOT NULL,
  issue_ref TEXT,
  slack_channel TEXT NOT NULL,
  slack_thread_ts TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'creating',
  worktree_path TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT
);
```

---

## 2. Structured Logging with Rotation (REQ-SB-2)

### Requirement
Log file output with rotation. Structured (machine-readable) format.

### Findings

#### pino + pino-roll — Recommended

- **pino:** Fastest Node.js JSON logger. Outputs structured JSON by default with `level`, `time`, `pid`, `hostname`, `msg` fields. Native ESM support. ~17M weekly downloads.
- **pino-roll v4.0.0:** Transport for log file rotation. ~275K weekly downloads. Actively maintained.
  - **Rotation triggers:** Frequency (`daily`, `hourly`, milliseconds), size (with units: `k`, `m`, `g`), or combined.
  - **File management:** Extension-last format (`filename.date.count.extension`), auto-directory creation (`mkdir: true`), symlink to active file.
  - **Retention:** `limit.count` controls max retained files.
- **ESM compatibility:** Both pino and pino-roll work with native ESM imports.

#### Usage Pattern

```typescript
import pino from 'pino';
import { join } from 'node:path';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
}, pino.transport({
  target: 'pino-roll',
  options: {
    file: join('logs', 'runner'),
    frequency: 'daily',
    mkdir: true,
    limit: { count: 14 },
  },
}));
```

#### Alternative: winston

- More feature-rich but significantly slower than pino.
- Built-in file rotation via `winston-daily-rotate-file`.
- Overkill for this use case.

### Recommendation

**Use `pino` + `pino-roll`.** Native ESM, structured JSON by default, daily rotation with retention limits. Two new dependencies (`pino`, `pino-roll`).

### Integration Notes

- Replace existing `console.error()` / `console.log()` calls in runner modules with `logger.info()` / `logger.error()`.
- Pass a child logger with session context: `logger.child({ sessionId, workflowId })`.
- pino's transport runs in a separate worker thread — log writes do not block the event loop.

---

## 3. ACP Protocol Validation (REQ-MC-1, REQ-MC-2)

### Requirement
Verify ACP protocol assumptions before merge. Three unverified assumptions in the PoC.

### Findings

The ACP protocol is documented at [agentclientprotocol.com](https://agentclientprotocol.com/) and [cursor.com/docs/cli/acp](https://cursor.com/docs/cli/acp).

#### Assumption #1: `cursor/ask_question` params format
- **Status:** Unverified — exhaustive research conducted.
- **Evidence:**
  - Cursor's docs list `cursor/ask_question` as an extension method that "asks users multiple-choice questions" but do **not** document the exact params schema.
  - **`cursor/ask_question` is a Cursor-proprietary extension**, not part of the standard ACP spec. The ACP spec uses `_underscore` prefix for standard extensions (e.g., `_zed.dev/...`); Cursor uses its own `cursor/` namespace.
  - **No open-source ACP adapter handles `cursor/ask_question`** because all existing adapters (blowmage, roshan-c, konsumer) wrap `cursor-agent --print` (stream-json mode), not `agent acp` (JSON-RPC stdio mode). The Cursor extension methods only exist in `agent acp` mode.
  - The ACP SDK provides generic `ExtRequest`/`ExtResponse` types with `Record<string, unknown>` params — confirming extension method params are implementation-defined (no schema to discover from the SDK).
  - The PoC's `AcpAskQuestionParams` interface matches the Cursor IDE's `AskQuestion` tool schema exactly:
    ```typescript
    { title?: string; questions: Array<{ id: string; prompt: string;
      options: Array<{ id: string; label: string }>; allow_multiple?: boolean }> }
    ```
    Since Cursor's agent generates `AskQuestion` tool calls internally and forwards them to the ACP client as `cursor/ask_question` requests, the format is expected to match.
- **Risk Mitigation:** A format mismatch would produce a clear, immediate error during live validation — the checkpoint bridge would receive unexpected params and fail to parse them. This is easily debuggable and fixable without architectural changes.
- **Verdict:** Live validation remains the only way to confirm. The inference from the IDE tool schema is sound but unverifiable until tested.

#### Assumption #2: `session/new` mcpServers format
- **Status:** Validated by ACP schema.
- **Evidence:** The ACP schema ([NewSessionRequest](https://agentclientprotocol.com/protocol/schema)) defines `mcpServers` as `McpServer[]` with properties: `name`, `command`, `args`, `env`. The PoC's `createSession()` sends exactly this format. Confirmed by the official minimal client example.
- **Action:** Mark as verified in assumptions log.

#### Assumption #3: `session/request_permission` response format
- **Status:** Validated by ACP schema and Cursor docs.
- **Evidence:** The ACP schema defines `RequestPermissionResponse` with `outcome: RequestPermissionOutcome`. Cursor docs list valid outcomes: `allow-always`, `allow-once`, `reject-once`. The PoC responds with `{ outcome: { outcome: 'selected', optionId: 'allow-always' } }`.
- **Action:** Mark as verified in assumptions log.

#### Additional Protocol Observations

- **`session/prompt` content format:** The PoC sends `prompt: [{ type: 'text', text: '...' }]`. This matches the ACP `PromptRequest` schema (`ContentBlock[]` with `type` discriminator) and the official minimal client example.
- **Session flow order:** The PoC follows the correct sequence: spawn → initialize → authenticate → session/new → prompt.
- **Streaming output:** `session/update` notifications with `agent_message_chunk` and `content.text` — confirmed by schema and minimal client example.
- **Extension method naming:** Cursor uses `cursor/` namespace for its proprietary extensions, distinct from the ACP standard `_underscore` convention. Our PoC correctly routes on `req.method === 'cursor/ask_question'` as a raw JSON-RPC method match, bypassing the ACP SDK's `ExtRequest` abstraction — this is the correct approach since we're the client, not using the SDK's agent-side connection.

### Recommendation

Mark assumptions #2 and #3 as **verified**. Assumption #1 remains **unverified** after exhaustive research — this is a Cursor-proprietary format that is not documented publicly and not implemented by any open-source ACP adapter. Live validation is the only path to confirmation.

### Response Format Analysis

The PoC's `CheckpointBridge.resolveCheckpoint()` responds to `cursor/ask_question` with:
```typescript
acpClient.respond(checkpoint.acpRequestId, {
  outcome: { outcome: 'selected', responses: [{ questionId, selectedOptions: [optionId] }] }
});
```

This mirrors the `session/request_permission` response pattern (`{ outcome: { outcome: 'selected', ... } }`). The `responses` array with `questionId` and `selectedOptions` is inferred from the `AskQuestion` tool's semantics. If the actual response format differs (e.g., flat `{ questionId, selectedOption }` without the `outcome` wrapper), the agent would receive an unexpected response shape. Again, this would fail immediately and visibly during live validation.

---

## 4. Process Crash Handling (REQ-SC-2)

### Requirement
Runner must handle agent crashes gracefully: post error to Slack thread, clean up worktree.

### Findings

#### Current PoC Implementation

The PoC's `SessionManager` already handles the core crash flow:

1. **`AcpClient`** listens to `close` event on the child process (correct — `close` fires after all stdio streams are closed, unlike `exit`).
2. **`AcpClient`** calls `rejectAllPending()` on close, rejecting any in-flight JSON-RPC promises.
3. **`SessionManager.wireAcpEvents()`** handles the `close` event: if session is not already completed/errored, calls `handleError()`.
4. **`handleError()`** sets error state, posts error to Slack, calls `cleanupSession()`.
5. **`cleanupSession()`** kills ACP client and removes worktree.

#### Gaps Identified

1. **Double-cleanup guard:** If both `error` and `close` events fire (which can happen), `handleError` could be called twice. The status check (`!== 'completed' && !== 'error'`) guards against the `close` handler's path, but the `error` event handler only logs to console — it doesn't trigger cleanup. This is acceptable but should be documented.

2. **Agent stderr as error signal:** The PoC treats all stderr output as errors (`this.emit('error', new Error(...))`). In practice, Cursor CLI writes diagnostic logs to stderr that are not errors. This will generate noise. Stderr should be logged at `debug` or `warn` level, not emitted as errors.

3. **Worktree cleanup on runner crash:** If the runner process itself crashes (not just the agent), worktrees are orphaned. A startup sweep that removes stale worktrees (from previous runs) would improve robustness.

#### Best Practices from Node.js Documentation

- **Always use `close` event for cleanup** (not `exit`) — guarantees stdio streams are closed.
- **Guard against double execution** when listening to both `error` and `close`.
- **Use `{ stdio: ['pipe', 'pipe', 'pipe'] }`** (as the PoC does) to capture all output for logging.
- **Kill child processes on parent exit** — consider registering a `process.on('exit')` handler.

### Recommendations

1. Add a startup worktree sweep: on runner start, check for and remove any orphaned worktrees from previous runs.
2. Downgrade stderr handling from `error` to logged diagnostic output.
3. Register a `process.on('SIGINT')` / `process.on('SIGTERM')` handler to clean up all active sessions on runner shutdown.

---

## 5. Synthesis: Requirements Coverage

| Requirement | Solution | Confidence | Notes |
|------------|----------|------------|-------|
| REQ-SB-1: SQLite persistence | `node:sqlite` (DatabaseSync) | High | Zero deps, native ESM, Node.js 24.2.0 |
| REQ-SB-2: Structured logging | pino + pino-roll | High | Proven stack, ESM-compatible |
| REQ-SB-4: Survive restarts | SQLite + startup recovery | High | Read persisted sessions on start |
| REQ-MC-1: Live validation | Test protocol end-to-end | — | Requires Slack App + Cursor CLI |
| REQ-MC-2: ACP assumptions | #2 verified, #3 verified, #1 pending | Medium | cursor/ask_question is primary risk |
| REQ-SC-2: Crash handling | Existing flow + worktree sweep + stderr fix | High | Minor improvements to PoC |
| REQ-DO-1: Dev machine, CLI only | No changes needed | High | PoC already uses `agent acp` binary |
| REQ-DO-2: Manual start | `npm run runner` script | High | Add to package.json scripts |

---

## 6. Applicable Patterns

| Pattern | Source | Application |
|---------|--------|-------------|
| Synchronous SQLite for local state | Node.js built-in module | Session persistence with `DatabaseSync` |
| Structured JSON logging with transport | pino ecosystem | Replace console.* with pino logger |
| Child process lifecycle via `close` event | Node.js docs | Already implemented in PoC |
| Worktree-per-session isolation | Git worktrees | Already implemented in PoC |
| Startup recovery sweep | Production services pattern | Add stale worktree detection on boot |

---

## 7. Risks and Anti-Patterns

| Risk | Severity | Mitigation |
|------|----------|------------|
| `cursor/ask_question` params differ from PoC model | Medium | Live validation is a merge gate. If format differs, checkpoint bridge needs updating |
| `node:sqlite` stability 1.2 (not yet stable) | Low | Acceptable for developer tooling; pin Node.js version |
| Orphaned worktrees on runner crash | Low | Startup sweep removes stale worktrees |
| Stderr noise from Cursor CLI logs | Low | Downgrade to debug-level logging |
| pino transport worker thread overhead | Very Low | Negligible for low-volume logging in dev tooling |

---

## 8. Research Assumptions

| # | Assumption | Category | Status |
|---|-----------|----------|--------|
| 13 | `node:sqlite` DatabaseSync API is stable enough for session persistence at the scale of this project | Pattern Applicability | Assumed |
| 14 | pino-roll v4 daily rotation + count-based retention is sufficient for runner log management | Pattern Applicability | Assumed |
| 15 | ACP `cursor/ask_question` params will match the Cursor IDE `AskQuestion` tool schema | Source Relevance | Unverified — primary protocol risk |
| 16 | A startup worktree sweep (removing worktrees matching the session naming pattern) is safe and won't remove user-created worktrees | Synthesis Decision | Assumed — use distinctive prefix (e.g., `wf-runner-`) |
