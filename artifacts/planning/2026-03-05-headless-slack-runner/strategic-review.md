# Strategic Review: Headless Slack Workflow Runner

**Branch:** `feat/headless-slack-runner`
**Diff range:** `main...HEAD` (11 commits)
**Diff summary:** 20 files changed, +3,148 / -10 lines
**Reviewer:** AI agent (strategic-review activity)

---

## Scope Assessment

### Verdict: PASS (minor cleanup items)

The diff is focused and minimal for the stated requirements. All 9 new source modules in `src/runner/` directly implement the headless Slack workflow runner specified in the requirements and implementation plan. The feature cleanly lives in its own `src/runner/` directory with no modifications to existing source code.

### Requirement Traceability

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| REQ-SB-1 (SQLite persistence) | `session-store.ts` | Implemented |
| REQ-SB-2 (Structured logging) | `logger.ts`, pino+pino-roll | Implemented |
| REQ-SC-2 (Graceful crash handling) | `shutdownAll()`, `sweepOrphaned()` | Implemented |
| REQ-DO-2 (npm run runner) | `package.json` scripts | Implemented |
| REQ-MC-1 (Live validation) | Pending — merge gate | Not yet verified |

### Scope Expansion (positive)

The implementation plan explicitly stated "Out of Scope: Unit tests for SessionManager or SlackBot." The PR includes 5 test files (917 lines) covering `acp-client`, `checkpoint-bridge`, `session-manager`, `session-store`, and `worktree-manager`. This is a positive deviation that improves quality and should remain.

---

## Files Review

### Files that belong (no action needed)

| File | Lines | Justification |
|------|------:|---------------|
| `src/runner/acp-client.ts` | 343 | Core JSON-RPC 2.0 transport for Cursor ACP |
| `src/runner/checkpoint-bridge.ts` | 141 | Bridges ACP checkpoints to Slack interactive messages |
| `src/runner/config.ts` | 73 | Zod-validated configuration |
| `src/runner/index.ts` | 49 | Composition root / entry point |
| `src/runner/logger.ts` | 20 | Pino logger with daily rotation |
| `src/runner/session-manager.ts` | 362 | Session lifecycle orchestrator |
| `src/runner/session-store.ts` | 102 | SQLite persistence layer |
| `src/runner/slack-bot.ts` | 161 | Slack Bolt app with slash commands |
| `src/runner/worktree-manager.ts` | 173 | Git worktree isolation |
| `tests/runner/*.test.ts` | 917 | Unit tests for 5 modules |
| `package.json` | — | Dependencies + runner script |
| `package-lock.json` | 785 | Lockfile for new dependencies |
| `.env.example` | 16 | Configuration template |
| `.gitignore` | 3 | `data/` exclusion for SQLite |

### Files that should be removed from this PR

**S1. `.engineering` submodule pointer change**
The submodule commit pointer changed from `a9e3168` to `93e57a5`. This was updated during the planning phase and is unrelated to the headless runner code. It should be reverted in this branch to keep the diff clean.

```
-Subproject commit a9e31687a403030721b91bfcf01ee7e9130f705b
+Subproject commit 93e57a5d6fe4d82adc9040e3bc3bd9118d375b00
```

*Action:* `git checkout main -- .engineering` to revert the submodule pointer.

**S2. `tests/mcp-server.test.ts` — unrelated test fix**
The resource index change from `'00'` to `'01'` is not related to the headless runner feature. This appears to fix a pre-existing test for a resource index that was renumbered. It should be committed separately on `main` or acknowledged in the PR description as an incidental fix.

---

## Over-Engineering Concerns

No significant over-engineering detected. The architecture is appropriately layered for the problem:

- **Transport** (`acp-client`) — clean JSON-RPC 2.0 implementation
- **Integration** (`slack-bot`, `checkpoint-bridge`) — minimal Slack surface area
- **Lifecycle** (`session-manager`) — single orchestrator, no unnecessary abstraction
- **Infrastructure** (`session-store`, `worktree-manager`, `config`, `logger`) — each module has a single responsibility

The dependency count (+4 runtime deps: `@slack/bolt`, `dotenv`, `pino`, `pino-roll`) matches the implementation plan with no extras.

---

## Orphaned Infrastructure

**O1. `followUp()` method is dead code**
`src/runner/acp-client.ts:215–221` — The `followUp()` method is functionally identical to `prompt()` (already flagged as M4 in code review) and has no callers anywhere in the codebase. This should be removed for a cleaner diff.

---

## Notable Non-Issues

**`@types/node` major version bump (^20 → ^22)**
Required for `node:sqlite` type definitions. Since the implementation already depends on `node:sqlite` (available since Node 22.5.0), this is consistent. Not a concern.

**New dependencies are all justified:**
- `@slack/bolt` — Slack integration (core feature)
- `dotenv` — Environment variable loading (standard Node.js practice)
- `pino` + `pino-roll` — Structured logging with rotation (REQ-SB-2)

---

## Summary

| Category | Count | Items |
|----------|------:|-------|
| Remove from PR | 2 | S1 (`.engineering` submodule pointer), S2 (`mcp-server.test.ts` fix) |
| Dead code | 1 | O1 (`followUp()` method) |
| Over-engineering | 0 | — |
| Scope creep | 0 | — |
| Positive scope expansion | 1 | Test coverage beyond plan |

### Recommendation

**PASS.** The diff is minimal and focused for the stated requirements. Three minor cleanup items should be addressed before PR submission:

1. Revert `.engineering` submodule pointer to match `main`
2. Split out the `mcp-server.test.ts` fix to a separate commit or PR
3. Remove the unused `followUp()` method from `acp-client.ts`

None of these items warrant re-planning or significant rework.
