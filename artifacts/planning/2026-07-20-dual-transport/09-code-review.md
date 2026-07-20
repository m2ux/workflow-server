# Code Review

> Dual Transport Support · issue skipped · updated 2026-07-20

## Lean-Coding Audit

Scope: the dual-transport change (`src/config.ts`, `src/index.ts`, `src/transports/{stdio,http}.ts`, `src/middleware/{request-id,logging,error-handler}.ts`, `tests/config.test.ts`, `tests/http-transport.test.ts`). Lens: over-engineering only (deletion / stdlib replacement / language-native replacement / YAGNI abstraction / shrinkable block) — correctness, security, and performance are out of scope (safety floor).

### Findings

- **[shrinkable]** `tests/http-transport.test.ts` — the identical `beforeEach`/`afterEach` pair (`buildConfig()` → `createHttpApp()` → track `workspaceDir`; `rmSync(workspaceDir, …)` on teardown) is repeated verbatim across 4 of the 5 `describe` blocks (health/readiness, request-id propagation, error shape, MCP session lifecycle — only graceful-shutdown's setup differs, since it also needs `app.listen`). Hoisting the shared pair into one outer `describe('HTTP transport', …)` with the four topic blocks nested inside would remove 3 of the 4 duplicate 12-line setup/teardown pairs. Est. savings: ~34 lines.

No other findings — the middleware split (`request-id.ts`/`logging.ts`/`error-handler.ts`), the `createHttpApp`/`startHttpServer` split (for testability), and the standalone `shutdownHandler` (for direct unit testing without dispatching real OS signals) are all called for by the work-package plan's Task 3/4 deliverables or are exercised directly by a test, not speculative abstraction.

### Scoreboard (initial pass)

net: -34 lines (all in test setup; no production-code findings)

**Disposition:** presented to the user at the `audit-findings-confirmed` checkpoint — accept as-is, apply, or dispute. User selected `apply-simplifications`.

## Simplification Applied

Hoisted the duplicated `beforeEach`/`afterEach` (`buildConfig()` → `createHttpApp()` → track `workspaceDir`; `rmSync` on teardown) out of the 4 repeating `describe` blocks into one outer `describe('HTTP transport', …)`, with the 5 topic blocks nested inside it. `graceful shutdown` keeps its own additional `beforeEach` for `app.listen`, since that part wasn't shared. Safety floor validated: `npx vitest run tests/http-transport.test.ts` (same 11 cases, all passing) and `npm run typecheck` both clean after the change — behavior unchanged, only setup/teardown structure changed.

### Re-score

net: **-46 lines** (103 insertions, 149 deletions in `tests/http-transport.test.ts`; commit `767f531a`)

No accepted-but-unapplied simplifications remain — re-review surfaces no further findings. `needs_simplification` → `false`; the apply cycle exits after one iteration.
