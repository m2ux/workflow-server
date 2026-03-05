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
