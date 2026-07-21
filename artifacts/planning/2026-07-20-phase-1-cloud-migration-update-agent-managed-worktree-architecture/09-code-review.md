# Code Review

> Phase 1 agent-managed worktree architecture · issue skipped · updated 2026-07-21

## Lean-Coding Audit

Scope: PR #267 change (`src/config.ts`, `src/server.ts`, `src/worktree-validator.ts`, `src/utils/session/store.ts`, `src/transports/http.ts`, `tests/*`, `Dockerfile`, `docker-compose.yml`, docs). Lens: over-engineering only (delete / stdlib / native / yagni / shrink) — correctness, security, and performance out of scope (safety floor).

### Findings (initial pass)

`src/worktree-validator.ts:L86-88`: yagni `assertPlanningPathInsideRoot` one-line alias of `assertPathInsideRoot` — unused in production (`ensurePlanningFolder` calls `assertPathInsideRoot` directly). Delete the wrapper and its dedicated test describe. (~7 prod + ~12 test)

`src/worktree-validator.ts:L20-27,L59-68`: yagni `AssertPathInsideRootOptions` / `realpath: false` branch — no production caller disables realpath; only the skip-realpath unit test uses it. Always realpath; drop the options type and the off-switch test. (~15 prod + ~9 test)

`src/utils/session/store.ts:L68-71`: delete `getPlanningRelativeDir` — test-only getter. Assert via `planningRoot(workspace)` (or the active dir through known defaults) instead. (~4)

`src/config.ts:L110-111`: shrink duplicate `DEFAULT_PLANNING_RELATIVE_DIR` — same string as `PLANNING_RELATIVE_DIR` in store; reuse the store constant (config already imports from store). (~3)

`tests/worktree-validator.test.ts:L116-119`: delete sep-sanity smoke assert (`sep === '/' || sep === '\\'`) — not a behavioural check for this change. (~4)

No other findings — `WORKTREE_ROOT` alias, module-level `setPlanningRelativeDir` (preserves one-arg `planningRoot`), dual apply in `loadConfig`/`createServer` for distinct entry points, path-containment validator, and Docker/agent docs are plan-required or have concrete callers.

### Scoreboard (initial pass)

net: -54 lines possible.

**Disposition:** user selected `apply-simplifications` at `audit-findings-confirmed`.

## Simplification Applied

Applied all five findings in the target worktree. Marked the always-realpath ceiling with a ponytail marker. Safety floor validated: `npm run typecheck` and vitest (worktree-validator, config, session-store, http-transport — 84 tests) clean. Diff: +13 / −78 (net −65).

### Re-score

Lean already. Ship.

No accepted-but-unapplied simplifications remain — `needs_simplification` → `false`; apply cycle exits after one iteration.
