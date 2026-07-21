# Code Review

> Phase 1 agent-managed worktree architecture · issue skipped · updated 2026-07-21

## Manual Diff Review

> feat/phase-1-agent-managed-worktree vs main · 14 files reviewed · reviewer: user · Issues Found

### MD-1: Documentation voice — negative-definition slop

**File:** `Dockerfile` · **Row:** 1 · **Severity:** Medium  
**Issue:** Block 1 rationale (and matching Dockerfile / compose / SETUP / agent-managed-worktrees prose) highlighted absences ("no Git/SSH", "never owns worktree lifecycle") instead of stating what the image is and does. Same voice leaked into nearby change-block rationales and comments.  
**Recommendation:** Follow `.engineering/AGENTS.md` present-tense documentation voice — describe the system as it is. Rewrite Block 1 and scrub related negative-definition phrasing in index Blocks 3–5 / 7–10, Dockerfile and compose comments, SETUP/agent-managed docs, and `store.ts` ensurePlanningFolder comments.  
**Correction applied:** Affirmative rewrites landed in `10-change-block-index.md`, `Dockerfile`, `docker-compose.yml`, `SETUP.md`, `docs/agent-managed-worktrees.md`, and `src/utils/session/store.ts` comments.

### MD-2: Stale MCP client config examples omit required worktree-root bind

**File:** `README.md` · **Row:** 2 · **Severity:** Medium  
**Issue:** Cursor/Claude MCP JSON examples put `WORKFLOW_WORKSPACE` only in `env` and omitted `--workspace` on `args`, diverging from the live `.cursor/mcp.json` pattern and from the WP’s required worktree-root contract (`--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT`). Prose below the snippet already named the three binds; the copy-paste JSON did not. Same stale pattern in `SETUP.md` Cursor and Claude Desktop examples.  
**Recommendation:** Show `--workspace=/path/to/your/project` on `args` (matching `.cursor/mcp.json`); keep `WORKFLOW_DIR` in `env`; document the three equivalent root binds in the surrounding prose.  
**Correction applied:** README and SETUP MCP examples updated to the `--workspace` args form with affirmative bind prose.

### MD-3: Worktree-root path semantics in MCP examples

**File:** `README.md`, `SETUP.md` · **Row:** 2 · **Severity:** Medium  
**Issue:** MCP client config examples used `--workspace=/path/to/your/project` (and matching HTTP one-liners). That placeholder reads as a single project path; under agent-managed worktrees the startup bind is a **worktree root** (a directory that may hold many agent worktrees / projects).  
**Recommendation:** Use worktree-root placeholders such as `--workspace=/path/to/worktree-root` or `/worktrees`; keep the real bind forms visible (`--workspace=...`, `WORKFLOW_WORKSPACE`, `WORKTREE_ROOT`); describe what the path is in affirmative docs voice.  
**Correction applied:** README and SETUP MCP/HTTP examples and surrounding prose updated to `/path/to/worktree-root` with explicit worktree-root semantics. `docs/agent-managed-worktrees.md` already used worktree-root language for the startup bind — no change required there.

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

## Summary

**Overall Quality:** 4/5 — Critical: 0 · High: 0 · Medium: 0 open · Low: 0 · Informational: 1

Automated post-impl review of PR #267 (14 authored files + uncommitted doc-voice / MCP-example corrections). Manual findings MD-1, MD-2, and MD-3 are Medium and corrected. Lean audit already applied. No open code defects at Minor or above.

## Module Overview

Phase 1 agent-managed worktree bind: `WORKTREE_ROOT` alias into required `workspaceDir`, `PLANNING_SLUG` → `setPlanningRelativeDir` (one-arg `planningRoot` preserved — GitNexus CRITICAL, 15 processes), greenfield `assertPathInsideRoot` wired in `ensurePlanningFolder`, `/ready` gated on configured root, Docker/Compose + agent/operator docs.

## Findings

### Informational

**CR-1: GitNexus index stale relative to feature worktree**

**File:** (tooling) · **Severity:** Informational  
`gitnexus_detect_changes` compare-vs-main reported only `AGENTS.md` / `CLAUDE.md` touches; `assertPathInsideRoot` is not yet in the indexed symbol set. Blast-radius calls on `planningRoot` / `resolveWorkspaceDir` remain useful. Re-run `npx gitnexus analyze` on the worktree before merge if process traces must include the new validator.

## Strengths

- `planningRoot(workspaceDir)` arity unchanged; CRITICAL fan-out contained via module-level relative-dir injection
- Containment helper uses separator-aware prefix + realpath; `ensurePlanningFolder` asserts before mkdir (PR267-TC-12 covered)
- Config fail-fast lists all three root sources; HTTP `checks.workspaceDir` key preserved for consumers
- MCP client examples use `--workspace` on args with worktree-root placeholders (MD-2, MD-3)

## Recommendations Summary

1. **Immediate:** None — MD-1/MD-2/MD-3 corrections applied; no open Minor+ code findings
2. **Near-term:** Refresh GitNexus index on the feature worktree (CR-1)
3. **Long-term:** None from this review

## Compliance

All 5 compliance categories met (TypeScript idioms, architecture, documentation voice after MD fixes, testing, error handling).

## Structural notes (complex path)

`dispatch-prism` is an empty action step in this activity; no separate `structural-analysis.md` was produced by the worker. Producer/clearer walk on `activePlanningRelativeDir`: set once at startup via `setPlanningRelativeDir` (`loadConfig` / `createServer`); process-lifetime binding with no unbounded growth path. Containment assertions on write paths fail closed — no reclaim imbalance.
