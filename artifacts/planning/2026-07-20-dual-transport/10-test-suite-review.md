# Test Suite Review

> Dual Transport Support · issue skipped · updated 2026-07-20

## Coverage Added

| Area | File | Cases |
|---|---|---|
| `--transport`/`--port`/`--host` CLI flags, env vars, and precedence | `tests/config.test.ts` | 12 |
| Health/readiness endpoints | `tests/http-transport.test.ts` | 3 |
| Request-id propagation | `tests/http-transport.test.ts` | 2 |
| Shared JSON error shape (404, missing session, unknown session) | `tests/http-transport.test.ts` | 3 |
| MCP session lifecycle (`initialize` → `tools/list` round-trip over real transport classes) | `tests/http-transport.test.ts` | 1 |
| `startHttpServer` binds to `config.host`/`config.port` | `tests/http-transport.test.ts` | 1 |
| Graceful shutdown (close + idempotent double-close) | `tests/http-transport.test.ts` | 2 |

**Total new/extended cases: 24.** All green (`npx vitest run tests/config.test.ts tests/http-transport.test.ts`), alongside a full `npm run typecheck` and `npm run build`.

## Gap Found and Closed

Initial pass: `createHttpApp` tests exercised every route via `supertest` without ever calling `app.listen()`, so `startHttpServer`'s actual use of `config.host`/`config.port` in the real bind call (`app.listen(port, host, …)`) was validated only by a one-off manual smoke test (`curl` against a locally-run built server), not by CI. Closed by adding **"binds to config.host/config.port rather than a hardcoded address"** (commit `86f698c2`), which calls `startHttpServer` with `port: 0` (OS-assigned ephemeral port) and asserts the bound address matches `config.host`.

## Gaps Considered and Not Closed

- **`index.ts`'s CLI `switch` dispatch itself.** Not unit-tested directly, consistent with the pre-existing codebase convention (the original `main()` was never unit-tested either — `index.ts` is a thin, side-effecting entry point calling `process.exit` on error). Both branches it dispatches to (`startStdioServer`, `startHttpServer`) are covered directly; the dispatch itself was additionally exercised via the manual smoke test (built `dist/index.js --transport=http`, real `initialize`/`tools/list` HTTP round-trip).
- **Idle-session eviction / multi-session-under-load behavior** for the in-memory `transports` map. Deferred alongside D-2 — no test added, since there's no eviction logic yet to test.

## Pre-existing, Unrelated Failures

`npx vitest run` reports 178 pre-existing failures across 15 files (all `workflow-e2e`/`snapshot` suites), caused by an empty `workflows/` directory in this worktree (a `git worktree add` checkout gap, not a code defect). Confirmed unrelated by `git stash`-ing every change on this branch and re-running: identical 178/15 failure count, only this work package's 1 new passing case absent. No action taken — out of scope for this work package; not introduced by it.

**Disposition:** gap closed inline; `needs_test_improvements` not set (no further action needed from the review-fix-cycle).
