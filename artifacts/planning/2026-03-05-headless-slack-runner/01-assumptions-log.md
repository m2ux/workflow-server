# Assumptions Log - Headless Slack Workflow Runner

**Created:** 2026-03-05

---

## Design Phase Assumptions

| # | Assumption | Status | Resolution |
|---|-----------|--------|------------|
| 1 | Cursor ACP `cursor/ask_question` params match the `AskQuestion` tool schema (title, questions with id/prompt/options) | Unverified | Based on ACP docs; needs live validation |
| 2 | Cursor ACP `cursor/ask_question` response format accepts `{ outcome: { outcome: "selected", responses: [...] } }` | Unverified | Modeled after `session/request_permission` response pattern |
| 3 | `session/new` accepts `mcpServers` as an array of `{ name, command, args, env }` objects | Verified | ACP schema confirms `McpServer[]` with `name`, `command`, `args`, `env` properties |
| 4 | Cursor CLI `agent` binary is available on PATH on the target host | Assumed | Prerequisite for deployment |
| 5 | Slack Socket Mode is sufficient for PoC (no public URL needed) | Verified | Slack Bolt SDK confirms Socket Mode uses outbound WebSocket |
| 6 | Git worktrees provide sufficient isolation for parallel workflows targeting different submodules | Verified | Git worktrees are independent working trees; submodules init separately per worktree |
| 7 | Agent streaming output via `session/update` with `agent_message_chunk` is frequent enough for meaningful Slack status posts | Unverified | Based on minimal ACP client example |
| 8 | `cursor/create_plan` can be auto-approved without user review | Assumed | Workflow orchestrator manages flow; plan approval is a workflow-internal concern |

## Elicitation Phase Assumptions

| # | Assumption | Status | Resolution |
|---|-----------|--------|------------|
| 9 | SQLite is sufficient for session state persistence at single-user scale | Assumed | User selected SQLite; no concurrent write contention expected with single-user operation |
| 10 | Rotating log file appender can be implemented with a lightweight dependency (e.g., `pino` + `pino-roll`) or stdlib | Assumed | Need to verify suitable Node.js logging library during research |
| 11 | The existing `handleError` → `cleanupSession` flow in SessionManager already satisfies the graceful crash handling requirement | Assumed | Code handles ACP close event and posts to Slack; may need additional edge case coverage |
| 12 | A single end-to-end workflow run via Slack constitutes sufficient live validation for merge | Confirmed | User explicitly stated this as the success criterion |

## Research Phase Assumptions

| # | Assumption | Status | Resolution |
|---|-----------|--------|------------|
| 13 | `node:sqlite` DatabaseSync API is stable enough for session persistence at single-user scale | Assumed | Stability 1.2 (RC) on Node.js 24.2.0; acceptable for developer tooling |
| 14 | pino-roll v4 daily rotation + count-based retention is sufficient for log management | Assumed | Standard pattern; 275K weekly downloads |
| 15 | ACP `cursor/ask_question` params match the Cursor IDE `AskQuestion` tool schema | Unverified | Exhaustive research confirms this is a Cursor-proprietary extension with no public schema. Format inferred from IDE tool definition. No open-source adapter implements it. Live validation required. |
| 16 | Startup worktree sweep (removing `wf-runner-*` prefixed worktrees) is safe | Assumed | Distinctive prefix avoids conflict with user-created worktrees |

## Implementation Analysis Phase Assumptions

| # | Assumption | Category | Status |
|---|-----------|----------|--------|
| 17 | The existing SessionManager architecture (event-driven, single-class orchestration) can accommodate SQLite persistence without major restructuring | Current Behavior | Assumed |
| 18 | The 4 untested modules (SessionManager, SlackBot, Config, index.ts) do not contain defects that would be caught by unit tests | Gap Identification | Assumed |
| 19 | Replacing console.* with pino will not affect the Slack Bolt SDK's internal logging behavior | Dependency Understanding | Assumed |
| 20 | The WorkflowSession interface fields map cleanly to the SQLite schema columns proposed in research (excluding runtime-only fields: acpClient, pendingText, updateTimer) | Baseline Interpretation | Assumed |

## Planning Phase Assumptions

| # | Assumption | Category | Status |
|---|-----------|----------|--------|
| 21 | Installing logging (pino) before persistence (SQLite) is the correct ordering — persistence code benefits from structured logging from day one | Task Breakdown | Assumed |
| 22 | `node:sqlite` `DatabaseSync` supports `:memory:` path for in-memory databases, enabling unit tests without filesystem side effects | Test Strategy | Validated |
| 23 | Creating `SessionStore` as a separate module (rather than embedding in SessionManager) provides sufficient interface boundary via save/load/updateStatus methods | Design Approach | Validated |
| 24 | Parallel session cleanup during shutdown via `Promise.allSettled` is safe — sessions are independent and cleanup operations do not interfere | Design Approach | Validated |
| 25 | The `wf-runner-*` prefix is unique to runner-managed worktrees and will not collide with user-created worktrees | Scope Decisions | Partially Invalidated |
| 26 | `git worktree list` output format is stable and parseable for identifying stale worktrees by path | Dependency Assumptions | Validated |
| 27 | pino's worker-thread transport (pino-roll) does not interfere with AcpClient's child process stdio pipes | Dependency Assumptions | Validated |

## Assumption Reconciliation (Planning Phase)

### Code-Resolvable Findings

**#17 — SessionManager can accommodate SQLite (Validated)**
SessionManager uses `this.sessions = new Map<string, WorkflowSession>()` with clear lifecycle points: session creation (line 89), status transitions (lines 98, 172, 217, 234), and cleanup (line 245). Adding `store.save()` at creation and `store.updateStatus()` at transitions is purely additive. The constructor already accepts dependency injection (`config`, `slackClient`); adding `SessionStore` as a third parameter is straightforward.

**#19 — pino won't affect Slack Bolt SDK logging (Validated)**
Slack Bolt SDK uses its own internal `Logger` interface with `ConsoleLogger` as default. The runner code does not inject a custom logger into the Bolt `App` constructor. Replacing our `console.*` calls with pino operates on a separate output channel; Bolt's internal logging is unaffected.

**#20 — WorkflowSession fields map to SQLite schema (Validated)**
All persistent fields map directly: `id`, `status`, `workflowId`, `targetSubmodule`, `issueRef`, `slackChannel`, `slackThreadTs`, `createdAt`, `completedAt`, `error`. The `worktree` object stores as `worktree_path TEXT` (path only). Runtime-only fields (`acpClient`, `pendingText`, `updateTimer`) are correctly excluded from the schema.

**#22 — `node:sqlite` supports `:memory:` (Validated)**
Standard SQLite behavior inherited by `node:sqlite`. `DatabaseSync` constructor accepts `':memory:'` as location parameter.

**#23 — SessionStore interface boundary (Validated)**
The interface (save/load/updateStatus/loadActive) covers all data operations: save at creation, updateStatus at transitions, loadActive at startup. Clean Data Access Object pattern.

**#24 — Promise.allSettled for parallel cleanup (Validated)**
`cleanupSession()` calls `acpClient.kill()` (per-session instance) and `worktreeManager.cleanup()` (distinct paths per session). Operations on different sessions are independent.

**#25 — Worktree prefix mismatch (Partially Invalidated)**
The research assumed `wf-runner-*` prefix, but the actual code uses `run-${runId}` (worktree-manager.ts:56). The `run-` prefix is less distinctive and could theoretically conflict with user-created worktrees. **Action:** Change the worktree directory prefix from `run-` to `wf-runner-` during Task 6 implementation. Update `sweepOrphaned()` to match this prefix. Also update the branch prefix from `runner/` to match.

**#26 — `git worktree list` parseable (Validated)**
Standard git output: `<path>  <hash> [<branch>]`. Also supports `--porcelain` for machine-parseable output.

**#27 — pino worker thread vs child process stdio (Validated)**
Worker threads run in the same Node.js process. Child process stdio pipes are OS-level kernel constructs independent of worker threads. No interference possible.

### Remaining Unresolvable Assumptions

| # | Assumption | Why Unresolvable |
|---|-----------|-----------------|
| 1, 2, 15 | ACP `cursor/ask_question` params/response format | Cursor-proprietary; requires live validation |
| 4 | Cursor CLI on PATH | Operational prerequisite |
| 7 | Agent streaming output frequency | Requires live observation |
| 8 | `cursor/create_plan` auto-approval safe | Design decision; verified by live behavior |
| 9 | SQLite sufficient at single-user scale | Design decision; validated by research |
| 13 | `node:sqlite` stability for dev tooling | External stability assessment; RC-stable |
| 14 | pino-roll rotation sufficient | External; 275K weekly downloads, standard pattern |
| 16 | Worktree sweep safe | Addressed by prefix fix (see #25 finding) |
| 21 | Logging-before-persistence ordering | Design decision; not code-verifiable |

---

## Implementation Phase Assumptions

Collected during Tasks 1–6 and reconciled against the implementation.

### Classification

| ID | Assumption | Category | Status |
|----|------------|----------|--------|
| IA-1 | No upstream consumers of the `error` event for stderr content; `error` listener only logs | Code-resolvable | Validated |
| IA-2 | `console.error` was the correct interim sink (replaced by pino in Task 4) | Code-resolvable | Validated |
| IA-3 | `Promise.allSettled` is the right concurrency strategy for parallel cleanup | Code-resolvable | Validated |
| IA-4 | `@types/pino-roll` doesn't exist; pino-roll ships its own types | Code-resolvable | Validated |
| IA-5 | Logger reads `LOG_LEVEL` directly from `process.env` at module load time (before config parsing) | Code-resolvable | Validated |
| IA-6 | `node:sqlite` `DatabaseSync` is available (Node v24.2.0) | Code-resolvable | Validated |
| IA-7 | Stale sessions from previous runs are marked as `error` with a diagnostic message | Code-resolvable | Validated |
| IA-8 | Default DB path `data/runner.db` is relative to CWD | Code-resolvable | Validated |
| IA-9 | `sweepOrphaned()` only targets `wf-runner-` prefixed worktrees | Code-resolvable | Validated |
| IA-10 | The sweep runs `git worktree prune` once after all removals | Code-resolvable | Validated |

### Implementation Phase Reconciliation

**IA-1 (Validated)** — `session-manager.ts` wires `acp.on('error', ...)` (line 243) and `acp.on('stderr', ...)` (line 238). The `error` event is for process-level errors; `stderr` is for stderr content. Both handlers only log; neither changes status or terminates the session. Downgrading stderr to debug did not affect any downstream behavior.

**IA-2 (Validated)** — Stderr is now logged via pino at debug level (`log.debug({ text }, 'agent stderr')`). The interim `console.error` sink was correctly replaced by pino in Task 4.

**IA-3 (Validated)** — `shutdownAll()` (lines 197–205) uses `Promise.allSettled(active.map((s) => this.cleanupSession(s)))`. Each `cleanupSession` operates on a distinct session (acpClient, worktree); operations are independent. `allSettled` is appropriate for parallel cleanup.

**IA-4 (Validated)** — `package.json` lists `pino-roll` as a dependency with no `@types/pino-roll`. The logger imports and uses pino-roll successfully; types are provided by the package.

**IA-5 (Validated)** — `logger.ts` line 4: `const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info'` is evaluated at module load. `index.ts` imports the logger before calling `loadRunnerConfig()`, so `LOG_LEVEL` is read before config parsing.

**IA-6 (Validated)** — `session-store.ts` imports `DatabaseSync` from `node:sqlite` and uses `new DatabaseSync(dbPath)`. The implementation assumes Node provides this API; runtime Node version is a deployment prerequisite.

**IA-7 (Validated)** — `SessionManager` constructor (lines 65–73) calls `store.loadActive()` and for each stale row runs `store.updateStatus(row.id, 'error', 'Stale session from previous run')`. Matches the assumption.

**IA-8 (Validated)** — `index.ts` line 19: `store.open(config.dbPath ?? 'data/runner.db')`. The default path has no leading slash and is relative to CWD. `config.dbPath` comes from `process.env['DB_PATH']` (optional).

**IA-9 (Validated)** — `worktree-manager.ts` line 106: `.filter((p) => path.basename(p).startsWith('wf-runner-'))`. Only `wf-runner-` prefixed worktrees are swept. Worktree creation (line 55) uses `wf-runner-${runId}`.

**IA-10 (Validated)** — `sweepOrphaned()` (lines 97–126) runs `git worktree prune` once at lines 122–124, only when `swept > 0`, after the removal loop.

### Stakeholder-Dependent Assumptions

None. All implementation assumptions were code-resolvable and have been validated against the implementation.
