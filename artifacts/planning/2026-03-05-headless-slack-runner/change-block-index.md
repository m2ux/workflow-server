# Change Block Index

**Branch:** `feat/headless-slack-runner`  
**Base:** `main`  
**Diff range:** `main...HEAD` (8 commits)  
**Total:** 17 files changed, 2551 insertions(+), 4 deletions(-)  
**Estimated review time:** ~9 minutes (30s per block)

| Block | File | Lines Changed | Change Summary |
|------:|------|---------------|----------------|
| 1 | `.engineering` | 1+/1- | Submodule pointer update (planning artifacts) |
| 2 | `.env.example` | +16 (new) | Environment template: Slack tokens, Cursor API key, repo path, worktree dir, MCP servers JSON |
| 3 | `.gitignore` | +3 | Add `data/` directory to ignores (SQLite DB storage) |
| 4 | `package-lock.json` | +777 (auto) | Lock file updates for new dependencies (37 hunks, auto-generated) |
| 5 | `package.json` | +7/-1 | Add `runner` script; add deps: `@slack/bolt`, `dotenv`, `pino`, `pino-roll` |
| 6 | `src/runner/acp-client.ts` | +319 (new) | ACP client: JSON-RPC 2.0 transport over stdio to Cursor agent, session lifecycle (create/resume/destroy), message streaming with EventEmitter |
| 7 | `src/runner/checkpoint-bridge.ts` | +141 (new) | Checkpoint bridge: intercepts ACP `askQuestion` calls, renders Slack blocks, resolves via Slack interaction callbacks |
| 8 | `src/runner/config.ts` | +73 (new) | Config module: Zod-validated env loading for Slack, Cursor, repo, worktree, and MCP server settings |
| 9 | `src/runner/index.ts` | +49 (new) | Entry point: wires config → stores → managers → Slack app, registers signal handlers for graceful shutdown |
| 10 | `src/runner/logger.ts` | +20 (new) | Pino logger with daily-rotating file transport via pino-roll, child logger factory |
| 11 | `src/runner/session-manager.ts` | +349 (new) | Session manager: orchestrates workflow sessions — create/resume/cancel/shutdown, maps sessions to ACP clients and worktrees, heartbeat monitoring, checkpoint bridging |
| 12 | `src/runner/session-store.ts` | +102 (new) | SQLite session store: CRUD for session metadata via `node:sqlite` `DatabaseSync`, schema auto-migration |
| 13 | `src/runner/slack-bot.ts` | +142 (new) | Slack bot: Bolt app setup with `/workflow` slash command (start/list/cancel/resume), action handler for checkpoint button interactions |
| 14 | `src/runner/worktree-manager.ts` | +154 (new) | Worktree manager: creates isolated git worktrees per session, generates `.cursor/mcp.json`, sweeps orphaned worktrees on startup |
| 15 | `tests/runner/acp-client.test.ts` | +170 (new) | Unit tests for AcpClient: spawn, createSession, sendMessage streaming, error/exit handling |
| 16 | `tests/runner/checkpoint-bridge.test.ts` | +123 (new) | Unit tests for CheckpointBridge: intercept → Slack render → resolve flow, timeout, cleanup |
| 17 | `tests/runner/worktree-manager.test.ts` | +108 (new) | Unit tests for WorktreeManager: create, cleanup, sweepOrphaned, MCP config generation |
