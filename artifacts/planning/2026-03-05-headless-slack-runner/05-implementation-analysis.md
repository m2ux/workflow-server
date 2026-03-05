# Implementation Analysis - Headless Slack Workflow Runner

**Date:** 2026-03-05
**Work Package:** Headless Slack Workflow Runner (#48)
**Status:** Complete

---

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| ACP Client | `src/runner/acp-client.ts` | JSON-RPC 2.0 stdio client for Cursor ACP protocol |
| Checkpoint Bridge | `src/runner/checkpoint-bridge.ts` | Routes ACP `cursor/ask_question` requests to Slack interactive messages |
| Config | `src/runner/config.ts` | Zod-validated configuration from environment variables |
| Entry Point | `src/runner/index.ts` | Bootstrap: config → Slack client → SessionManager → SlackApp |
| Session Manager | `src/runner/session-manager.ts` | Orchestrates workflow lifecycle: worktree → ACP → Slack events |
| Slack Bot | `src/runner/slack-bot.ts` | Slack Bolt app with `/workflow` command and button interaction handlers |
| Worktree Manager | `src/runner/worktree-manager.ts` | Git worktree creation/cleanup with `.cursor/` config placement |

### Architecture

The runner follows a layered event-driven architecture:

```
Slack (Socket Mode)
  └─ SlackApp (slack-bot.ts) — command parsing, interaction routing
       └─ SessionManager (session-manager.ts) — session lifecycle, event wiring
            ├─ AcpClient (acp-client.ts) — JSON-RPC 2.0 over stdio
            ├─ CheckpointBridge (checkpoint-bridge.ts) — ACP ↔ Slack checkpoint mapping
            └─ WorktreeManager (worktree-manager.ts) — git worktree isolation
```

**Data flow:** User sends `/workflow start` in Slack → SlackApp creates a thread → SessionManager creates worktree → spawns ACP agent → sends initial prompt. Agent responses stream back via `session/update` notifications. Checkpoints arrive as `cursor/ask_question` requests, are rendered as Slack buttons, and resolved when the user clicks.

### Usage Patterns

- **Trigger:** `/workflow start <workflow-id> <target-submodule> [issue-ref]` Slack command
- **Status:** `/workflow list` for active sessions
- **Checkpoint flow:** ACP `cursor/ask_question` → Slack buttons → Slack action → ACP response
- **Status streaming:** Agent text accumulated in `pendingText`, flushed to Slack thread every 5 seconds
- **Termination:** Agent completion or crash → error posted to Slack → worktree cleaned up

### Dependencies

**External packages (runtime):**

| Package | Usage | Module |
|---------|-------|--------|
| `@slack/bolt` | Slack Bot Framework (Socket Mode) | slack-bot.ts |
| `@slack/web-api` | Slack API client (type-only in most modules) | session-manager.ts, checkpoint-bridge.ts, index.ts |
| `dotenv` | `.env` file loading | index.ts |
| `zod` | Config schema validation | config.ts |

**Node.js built-ins:**

| Module | Usage |
|--------|-------|
| `node:child_process` | `spawn` (ACP), `execFile` (git) |
| `node:readline` | Line-by-line stdio parsing |
| `node:events` | `EventEmitter` base for AcpClient |
| `node:fs/promises` | Worktree config file writing |
| `node:path`, `node:os`, `node:util` | Path resolution, homedir, promisify |

**Internal dependencies (module coupling):**

| Module | Depends On |
|--------|-----------|
| index.ts | config, session-manager, slack-bot |
| slack-bot.ts | session-manager, config |
| session-manager.ts | acp-client, checkpoint-bridge, worktree-manager, config |
| checkpoint-bridge.ts | acp-client (types) |
| worktree-manager.ts | config (types) |
| acp-client.ts | (standalone — no internal deps) |
| config.ts | (standalone — only zod) |

`SessionManager` is the highest-coupling module, depending on 4 of 6 sibling modules. `AcpClient` and `config` are leaf modules with no internal dependencies.

---

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| ACP protocol handshake (init → auth → session → prompt) | Correct sequence per ACP schema; 5 unit tests passing | HIGH |
| JSON-RPC 2.0 request/response/notification routing | Full coverage in acp-client tests: responses resolve, requests emit, notifications route | HIGH |
| Checkpoint bridge (ACP → Slack → ACP) | 7 unit tests covering present, resolve, cancel, multi-question scenarios | HIGH |
| Git worktree isolation with `.cursor/` config | 4 unit tests verifying worktree add/cleanup, MCP config, CLI config | HIGH |
| Session lifecycle (create → running → checkpoint → complete/error) | Status transitions implemented; completion/error handlers clean up resources | MEDIUM |
| Config validation with Zod | Schema enforces `xoxb-` and `xapp-` prefixes, required fields | HIGH |
| SIGINT/SIGTERM shutdown handling | Registered in index.ts; calls `app.stop()` | MEDIUM |

### What's Not Working / Missing

| Issue | Evidence | Impact | Req |
|-------|----------|--------|-----|
| No state persistence — sessions are in-memory only | `sessions = new Map<string, WorkflowSession>()` in session-manager.ts | Sessions lost on restart | REQ-SB-1 |
| No structured logging — uses `console.log`/`console.error` | 8 console.* calls across 3 files, no log files | No persistent logs, no machine-readable output | REQ-SB-2 |
| No startup recovery — no detection of orphaned worktrees | `WorktreeManager` has no `sweep()` method | Worktrees orphaned on runner crash | REQ-SC-2 |
| stderr treated as error signal | `acp-client.ts:133-135` emits `error` event for all stderr output | False-positive errors from Cursor CLI diagnostics | REQ-SC-2 |
| No `npm run runner` script | package.json scripts missing runner entry | Cannot start runner as documented | REQ-DO-2 |
| No live validation performed | ACP assumption #1 unverified; no end-to-end test | Merge gate not yet met | REQ-MC-1 |
| No session cleanup on runner shutdown | SIGINT handler stops Slack app but doesn't clean up active sessions | Active agent processes and worktrees orphaned on graceful shutdown | REQ-SC-2 |

### Workarounds in Place

- **Permission auto-approval:** `request_permission` events auto-respond with `allow-always`. A hardcoded allowlist in `worktree-manager.ts` (lines 16-37) pre-configures `.cursor/cli.json` to reduce permission prompts. Acceptable for PoC.
- **Plan auto-approval:** `create_plan` events auto-responded with `{ accepted: true }`. Acceptable since the workflow orchestrator controls flow.
- **Slack text truncation:** Agent output truncated to last 3,000 chars in `flushPendingText`. Prevents Slack API errors but loses context for long outputs.

---

## Baseline Metrics

| Metric | Current Value | Measurement Method | Date |
|--------|--------------|-------------------|------|
| Source LOC (runner) | 1,120 lines | `wc -l src/runner/*.ts` | 2026-03-05 |
| Test LOC (runner) | 401 lines | `wc -l tests/runner/*.ts` | 2026-03-05 |
| Test:Source ratio | 0.36:1 | Test LOC / Source LOC | 2026-03-05 |
| Source modules | 7 files | `ls src/runner/*.ts` | 2026-03-05 |
| Test files | 3 files | `ls tests/runner/*.ts` | 2026-03-05 |
| Module test coverage | 43% (3/7 modules) | Test files / source modules | 2026-03-05 |
| Unit tests | 19 tests | `vitest run tests/runner/` | 2026-03-05 |
| Test pass rate | 100% (19/19) | vitest output | 2026-03-05 |
| Test execution time | 486ms | vitest duration | 2026-03-05 |
| External runtime deps | 4 packages | Import analysis (slack/bolt, slack/web-api, dotenv, zod) | 2026-03-05 |
| Node.js built-in deps | 6 modules | Import analysis | 2026-03-05 |
| console.* calls | 8 calls | Grep across src/runner/ | 2026-03-05 |
| TODO/FIXME markers | 0 | Grep across src/runner/ | 2026-03-05 |
| Persistence layer | None | Code inspection | 2026-03-05 |
| Log output | stdout/stderr only | Code inspection | 2026-03-05 |

### Key Findings

- The PoC has strong unit test coverage for its core protocol modules (`AcpClient`, `CheckpointBridge`, `WorktreeManager`) — 3 of 7 modules have tests, and all 19 tests pass.
- No tests exist for `SessionManager`, `SlackBot`, `Config`, or `index.ts`. These are the orchestration and I/O boundary modules, which are harder to unit test but represent the majority of the business logic.
- The codebase is compact (1,120 LOC) with clear module boundaries and no circular dependencies.
- Zero TODO/FIXME markers — the PoC was implemented to a consistent standard.

---

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority | Req |
|----|-----|---------------|---------------|--------|----------|-----|
| G1 | No state persistence | In-memory `Map<string, WorkflowSession>` | SQLite-backed sessions surviving restarts | Sessions lost on restart; no recovery possible | HIGH | REQ-SB-1 |
| G2 | No structured logging | 8 `console.*` calls; no log files | pino JSON logger with daily file rotation | No debugging capability post-mortem; no machine-readable logs | HIGH | REQ-SB-2 |
| G3 | No startup worktree recovery | No orphan detection | Sweep stale `wf-runner-*` worktrees on boot | Disk/git resource leak on crash | MEDIUM | REQ-SC-2 |
| G4 | stderr emitted as error | `this.emit('error', ...)` on all stderr | Log stderr at debug/warn level | False-positive error noise from Cursor CLI diagnostics | LOW | REQ-SC-2 |
| G5 | No runner shutdown cleanup | SIGINT stops Slack app only | Kill active ACP processes, remove worktrees | Active sessions orphaned on graceful shutdown | MEDIUM | REQ-SC-2 |
| G6 | No `npm run runner` script | No script entry | `"runner": "tsx src/runner/index.ts"` in package.json | Cannot start runner per deployment docs | LOW | REQ-DO-2 |
| G7 | Live validation not performed | ACP assumption #1 unverified | End-to-end workflow via Slack + Cursor ACP | Merge gate not met | HIGH | REQ-MC-1 |

---

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)

1. **Add `npm run runner` script:** Single line in package.json. Fulfills REQ-DO-2.
   - Effort: Minutes

2. **Downgrade stderr handling:** Change `this.emit('error', ...)` to a logged diagnostic in `acp-client.ts`. Eliminates false-positive noise.
   - Effort: Minutes

3. **Add SIGINT/SIGTERM session cleanup:** Extend the existing shutdown handler in `index.ts` to iterate active sessions and call `cleanupSession()`.
   - Effort: ~30 minutes

### Structural Improvements (Higher Effort)

1. **SQLite persistence layer:** Introduce a `SessionStore` backed by `node:sqlite` `DatabaseSync`. Replace the in-memory `Map` in `SessionManager`. Requires schema creation, session save/load, startup recovery.
   - Effort: ~2–3 hours
   - New dependencies: None (node:sqlite)

2. **Structured logging:** Replace all `console.*` calls with `pino` logger. Add `pino-roll` transport for daily file rotation. Pass child loggers with session context.
   - Effort: ~1–2 hours
   - New dependencies: pino, pino-roll

3. **Startup worktree sweep:** Add a `WorktreeManager.sweepOrphaned()` method called on runner boot. Uses distinctive worktree prefix to identify stale entries.
   - Effort: ~1 hour

### Deferred / Post-Merge

1. **SessionManager tests:** No unit tests currently exist. The module has the highest coupling (4 internal deps). Would require significant mocking infrastructure.

2. **Slack integration tests:** The `slack-bot.ts` module would benefit from integration tests but depends on Slack API mocking.

---

## Success Criteria

### Persistence (REQ-SB-1)
- [ ] Sessions survive runner restart (baseline: 0% survival → target: 100%)
- [ ] Measurement: Start workflow, restart runner, verify session resumes from persisted state

### Logging (REQ-SB-2)
- [ ] All runner output is structured JSON (baseline: 0 structured log calls → target: replace all 8 console.* calls)
- [ ] Log files rotate daily with 14-file retention (baseline: no log files → target: `logs/runner.*.log`)
- [ ] Measurement: Start runner, verify JSON output in log files, verify rotation after 24h or by date trigger

### Crash Handling (REQ-SC-2)
- [ ] Runner shutdown cleans up all active sessions (baseline: only Slack app stopped → target: ACP processes killed + worktrees removed)
- [ ] Orphaned worktrees cleaned on startup (baseline: no sweep → target: stale worktrees removed on boot)
- [ ] stderr does not trigger error events (baseline: all stderr → error → target: stderr logged at debug level)

### Live Validation (REQ-MC-1)
- [ ] One complete workflow run via Slack → Cursor ACP, including at least one checkpoint round-trip
- [ ] ACP assumption #1 (`cursor/ask_question` params format) verified or corrected

### Deployment (REQ-DO-2)
- [ ] Runner starts via `npm run runner` (baseline: no script → target: working script entry)

### Measurement Strategy

- **Persistence:** Manual test — start workflow, `kill -15` runner process, restart, verify session state in SQLite
- **Logging:** Inspect `logs/` directory for JSON log files after runner run
- **Crash handling:** Manual test — start workflow, `kill -9` runner, restart, verify orphaned worktrees are swept
- **Live validation:** Execute `/workflow start work-package midnight-node` in Slack, observe full execution including checkpoint interaction

---

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| Source code (7 files) | Implementation | Complete PoC architecture, clean module boundaries |
| Test suite (19 tests) | Quality | 100% pass rate; AcpClient, CheckpointBridge, WorktreeManager covered |
| package.json | Dependencies | 4 runtime deps; no runner script entry |
| .env.example | Configuration | 7 env vars required (3 Slack, 2 Cursor, 2 repo) |
| 04-research.md | Research | node:sqlite, pino+pino-roll recommended; ACP assumptions #2/#3 verified |
| 01-assumptions-log.md | Assumptions | 16 assumptions tracked; #1 and #15 remain unverified |

---

**Status:** Ready for plan-prepare activity
