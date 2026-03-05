# Code Review: Headless Slack Workflow Runner

**Branch:** `feat/headless-slack-runner`  
**Diff range:** `main...HEAD` (8 commits)  
**Scope:** 9 new source modules (`src/runner/`), 3 test files, config/dependency changes  
**Reviewer:** AI agent (post-impl-review activity)

---

## Summary

The implementation adds a headless Slack-based workflow runner that bridges Slack slash commands to Cursor ACP agent sessions. The architecture is clean with well-separated concerns across modules: JSON-RPC transport (`acp-client`), Slack integration (`slack-bot`, `checkpoint-bridge`), session lifecycle (`session-manager`), persistence (`session-store`), git isolation (`worktree-manager`), config (`config`), and logging (`logger`). The composition root (`index.ts`) wires everything together with graceful shutdown handling.

Overall code quality is good for a PoC. The findings below identify areas that should be tracked for hardening before production use.

---

## Findings

### Critical

*None.*

### High

**H1. Auto-approve all permission requests bypasses security guardrails**  
`src/runner/session-manager.ts:221–227`

The `request_permission` handler auto-approves every permission request from the ACP agent. While the `.cursor/cli.json` allowlist (placed by `worktree-manager`) gates most operations, any permission request that escapes the allowlist is silently approved. This effectively disables the permission system for edge cases the allowlist doesn't cover.

*Recommendation:* Log auto-approved permissions at `warn` level. Before production, implement a policy that either denies unknown permissions or routes them to Slack for human approval.

**H2. No timeout on JSON-RPC `send()` — potential promise leak**  
`src/runner/acp-client.ts:236–241`

The `send()` method creates a promise with no timeout. If the agent process hangs (stops responding without closing its stdio), pending promises accumulate indefinitely. `rejectAllPending()` only fires on process close.

*Recommendation:* Add a configurable per-request timeout (e.g., 60s for initialization, longer for prompts) that rejects the promise and optionally kills the process.

**H3. Slash command arguments flow into git commands without path validation**  
`src/runner/slack-bot.ts:90–98` → `src/runner/worktree-manager.ts:63–66`

The `targetSubmodule` string from the Slack slash command is passed directly to `git submodule update --init <targetSubmodule>`. While `execFile` prevents shell injection, a crafted value like `../../etc` would be interpreted as a relative path by git. This is mitigated by the worktree being in an isolated directory, but the submodule name should be validated against known submodules.

*Recommendation:* Validate `targetSubmodule` against the output of `git submodule status` in the repo, or maintain an allowlist in config.

---

### Medium

**M1. Unbounded text accumulation between Slack flushes**  
`src/runner/session-manager.ts:234–238`

Agent text chunks accumulate in `session.pendingText` without bounds. For long-running agents producing verbose output, memory consumption grows unchecked between the 5-second flush intervals.

*Recommendation:* Cap `pendingText` size (e.g., keep only the last 10KB) and discard older content with a truncation marker.

**M2. Session ID collision under rapid creation**  
`src/runner/session-manager.ts:346–348`

`generateId()` uses `Date.now().toString(36)` + 6 random base-36 characters. Under rapid sequential calls, `Date.now()` can return the same value, leaving only ~2 billion possible IDs from the random suffix. Collision probability is low but non-zero.

*Recommendation:* Use `crypto.randomUUID()` for guaranteed uniqueness.

**M3. SQLite `DatabaseSync` blocks the event loop**  
`src/runner/session-store.ts`

`node:sqlite`'s `DatabaseSync` is explicitly synchronous. Each `save()`, `updateStatus()`, and `loadActive()` call blocks the Node.js event loop. Acceptable for PoC throughput, but will become a bottleneck under concurrent sessions.

*Recommendation:* Track as a known limitation. Consider `better-sqlite3` (synchronous but faster) or an async driver if concurrency requirements grow.

**M4. `prompt()` and `followUp()` are functionally identical**  
`src/runner/acp-client.ts:195–211`

Both methods send `session/prompt` with the same payload structure. `followUp()` returns `unknown` while `prompt()` returns `PromptResult`, suggesting incomplete type differentiation for what may be the same underlying operation.

*Recommendation:* Either differentiate the methods (e.g., different parameters or behavior) or consolidate into one.

**M5. No cancel command implemented in Slack bot**  
`src/runner/slack-bot.ts`

The help text lists `start`, `list`, and `help` commands. There is no `cancel` command, even though `SessionManager` has the infrastructure to support cancellation (via `cleanupSession`). Users have no way to stop a runaway workflow from Slack.

*Recommendation:* Implement `/workflow cancel <session-id>` that calls `cleanupSession()` and posts a confirmation.

---

### Low

**L1. No retry logic for Slack API calls**  
`src/runner/session-manager.ts:333–344`

`postStatus()` catches Slack API errors but does not retry. Transient failures (rate limits, network blips) silently drop status messages. Users may lose visibility into workflow progress.

**L2. Serial orphan sweep could delay startup**  
`src/runner/worktree-manager.ts:99–128`

`sweepOrphaned()` processes orphaned worktrees sequentially. With many orphans (e.g., after a crash), startup could be noticeably delayed.

**L3. Logger transport created at module load**  
`src/runner/logger.ts`

The pino-roll transport is instantiated as a module-level side effect. This makes the module hard to test in isolation and means any import of `logger.ts` starts file I/O.

**L4. `eslint-disable` for Slack block types**  
`src/runner/checkpoint-bridge.ts:77–78`

The `as any[]` cast for Slack blocks is necessary due to SDK type limitations. The disable comment is appropriate; this is a known Bolt SDK ergonomic issue.

---

### Info

**I1. Good: Zod validation with prefix checks on tokens**  
`src/runner/config.ts:19–21` — Validates `xoxb-` and `xapp-` prefixes, providing fast failure with clear errors when misconfigured.

**I2. Good: Clean composition root pattern**  
`src/runner/index.ts` — Declarative wiring with explicit signal handling. Easy to follow startup/shutdown sequence.

**I3. Good: Typed EventEmitter on AcpClient**  
`src/runner/acp-client.ts:66–75` — The `AcpClientEvents` interface provides type safety for all emitted events, which is a strong pattern for this kind of transport layer.

**I4. Good: Stale session detection on startup**  
`src/runner/session-manager.ts:64–74` — Previously-active sessions are marked as `error` on startup rather than silently orphaned.

**I5. Good: Worktree isolation with `.cursor/cli.json` permissions**  
`src/runner/worktree-manager.ts:16–37` — Each worktree gets its own permission allowlist, providing defense-in-depth alongside the auto-approve behavior.

---

## Severity Summary

| Severity | Count | Action |
|----------|------:|--------|
| Critical | 0 | — |
| High | 3 | Track for pre-production hardening |
| Medium | 5 | Track; address before scaling beyond PoC |
| Low | 4 | Note for future improvement |
| Info | 5 | Positive observations |
