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

## Code Review (post-impl-review)

Full review of the branch diff (11 files, +1008/-11 at review time) for correctness, security, and maintainability, beyond the lean-coding pass above.

| Severity | Location | Finding |
|---|---|---|
| Low | `src/transports/http.ts` `registerMcpRoute` | The `transports: Map<string, StreamableHTTPServerTransport>` has no idle-session eviction. A client that `initialize`s and never sends `DELETE /mcp` (or whose transport-level `close`/error never fires) leaves its entry — and its `McpServer` — resident for the life of the process. Same pattern as the MCP SDK's own `simpleStreamableHttp.js` sample; not a regression this work package introduces, but worth naming rather than leaving implicit. |

**Disposition:** rolled into deferred item **D-2** (session resumability / multi-process sharing) rather than a separate ledger entry — an eviction policy (idle timeout, max-sessions cap) is the natural follow-up alongside an `EventStore`, and this work package's trusted-network, low-concurrency deployment model (per [02-design-philosophy.md](02-design-philosophy.md)) makes it acceptable to defer rather than block on. No `needs_code_fixes`.

No other correctness, security, or API-contract issues found. Middleware ordering (`requestId` → `requestLogging` → routes → 404 → `errorHandler`) is correct — `errorHandler`'s 4-arg signature is what makes Express treat it as the error handler, and it sits last so both route errors and the catch-all 404 flow through the same JSON shape.
