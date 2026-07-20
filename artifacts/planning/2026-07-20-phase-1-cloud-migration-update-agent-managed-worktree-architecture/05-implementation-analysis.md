# Implementation Analysis - Phase 1 Agent-Managed Worktree Architecture

> work-package · 2026-07-20 · Complete

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| Server config / required workspace bind | `src/config.ts` | `ServerConfig.workspaceDir`; `resolveWorkspaceDir` / `parseWorkspaceFlag`; `WorkspaceConfigError`; `loadConfig` |
| Planning root derivation | `src/utils/session/store.ts` | `PLANNING_RELATIVE_DIR = '.engineering/artifacts/planning'`; `planningRoot`; `ensurePlanningFolder`; `findPlanningFolderBySlug` |
| Session / planning bind | `src/tools/resource-tools.ts` | `start_session` treats `planning_folder` as basename slug hint under workspace planning root |
| HTTP readiness | `src/transports/http.ts` | `registerHealthRoutes`: `/health` (liveness), `/ready` checks `workflowDir`, `schemasDir`, `workspaceDir` |
| Worktree validator | `src/worktree-validator.ts` | **Absent** — greenfield for Phase 1 |
| Docker / Compose | repo root | **Absent** — no `Dockerfile` / `docker-compose` in reference or feature worktree |
| Operator / agent docs | `README.md`, `SETUP.md` | Document `WORKFLOW_WORKSPACE` / `--workspace`; no agent worktree lifecycle runbook |

### Usage Patterns

**How is it used today:**
- Operators/agents start the server with `--workspace=PATH` or `WORKFLOW_WORKSPACE` (required; CLI > env; no cwd fallback).
- Authenticated tools load sessions under `{workspaceDir}/.engineering/artifacts/planning/<slug>/`.
- Agents may pass absolute `planning_folder` to `start_session`; server uses basename only and resolves under its planning root.
- HTTP probes use `/health` (process up) and `/ready` (dirs exist, including `workspaceDir`).

**Call frequency:** Every process start (`loadConfig`); every authenticated tool call (session resolve via `workspaceDir`); every HTTP readiness probe (`/ready`).

### Dependencies

**Depends On:**
- `node:path` `resolve` / `join` for absolute workspace and planning paths
- `existsSync` for `/ready` directory presence
- Filesystem layout under workspace: `.engineering/artifacts/planning/`

**Depended On By:**
- `src/index.ts` → `loadConfig` → `createServer` / transports
- `src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts`, `src/utils/session/resolver.ts` — all session I/O via `workspaceDir`
- `tests/config.test.ts`, `tests/http-transport.test.ts`, `tests/session-store.test.ts` — baseline coverage

### Architecture

**Existing patterns:** Fail-fast required workspace bind; derived planning root from hard-coded relative dir; slug-hint session bind; split liveness/readiness.

**Known technical debt / gaps vs Phase 1 target:**
- Brief names (`WORKTREE_ROOT`, `PLANNING_SLUG`, `apply_workflow` + per-call `worktreeRoot`) do not match repo tools — adaptation locked (startup root + `start_session`).
- No path-containment validator module.
- No container packaging for worktree-root RW bind.
- Planning slug not configurable (constant only).

### GitNexus blast radius (reference_path index)

| Symbol | Upstream risk | Notes for plan |
|--------|---------------|----------------|
| `resolveWorkspaceDir` | LOW | Direct caller: `loadConfig`; tests in `config.test.ts` |
| `loadConfig` | LOW | Tested; entry from `main` |
| `planningRoot` | **CRITICAL** | 15 processes; Session module direct; tools/transports indirect — minimize signature change |
| `ensurePlanningFolder` | LOW (direct) | Called via resource-tools; keep path derivation stable |
| `registerHealthRoutes` | LOW | `createHttpApp` + `http-transport.test.ts` |

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Required workspace at startup | `resolveWorkspaceDir` throws `WorkspaceConfigError` when CLI/env absent; `tests/config.test.ts` covers CLI, env, precedence, empty/whitespace | HIGH |
| `/ready` gates on workspace dir | `registerHealthRoutes` returns 503 when `workspaceDir` missing; `http-transport.test.ts` asserts 200/503 + `checks.workspaceDir` | HIGH |
| Monorepo planning path default | `PLANNING_RELATIVE_DIR` matches locked DP-2a / SC-3 default | HIGH |
| Agent planning path hint safety | `start_session` docstring + basename-only slug; off-workspace paths ignored | HIGH |
| Split health vs ready | `/health` always 200; `/ready` dependency checks — matches research/K8s practice | HIGH |

### What's Not Working

| Issue | Evidence | Impact |
|-------|----------|--------|
| No `WORKTREE_ROOT` / brief naming | `loadConfig` only reads `WORKFLOW_WORKSPACE` / `--workspace` | MEDIUM — operator migration / brief alignment |
| Planning slug not configurable | `PLANNING_RELATIVE_DIR` constant; no `PLANNING_SLUG` | HIGH vs SC-3 override requirement |
| No worktree path containment | No `worktree-validator.ts`; no sep-aware containment helper in `src/` | HIGH vs SC-4 |
| No Docker worktree-root volume story | No Dockerfile/compose in tree | HIGH vs SC-5/SC-6 container goals |
| Brief `apply_workflow` surface absent (correctly) | Grep/tools inventory; DP-1 invalidated | LOW as bug — HIGH as mis-implementation risk if plan follows brief literally |

### Workarounds in Place
- Agents/operators already bind the monorepo (or project) root via `--workspace` / `WORKFLOW_WORKSPACE` — the hard-cutover root pattern exists under older names.
- Planning isolation is per-slug under one process-bound workspace, not per agent-created nested worktree under a shared `/worktrees` root (Phase 1 container model).

## Baseline Metrics

| Metric | Current Value | Measurement Method | Date Measured |
|--------|--------------|-------------------|---------------|
| Fail-fast without workspace | Throws `WorkspaceConfigError` (no silent cwd) | `tests/config.test.ts` «neither source provided» (3 cases) | 2026-07-20 |
| `/ready` without workspace dir | HTTP 503, `status: not-ready`, `checks.workspaceDir: false` | `tests/http-transport.test.ts` | 2026-07-20 |
| `/ready` with valid dirs | HTTP 200, `status: ready`, three checks true | `tests/http-transport.test.ts` | 2026-07-20 |
| Default planning relative path | `.engineering/artifacts/planning` | `PLANNING_RELATIVE_DIR` constant + `planningRoot` join | 2026-07-20 |
| `WORKTREE_ROOT` env support | Absent (0 references in `loadConfig`) | Code read of `src/config.ts` | 2026-07-20 |
| `PLANNING_SLUG` env/config support | Absent | Code read of `config.ts` / `store.ts` | 2026-07-20 |
| Path-containment module | Absent (0 files) | Glob `**/worktree*` under reference_path | 2026-07-20 |
| Docker packaging for worktree root | Absent (0 Dockerfiles) | Glob `Dockerfile*` / `docker-compose*` | 2026-07-20 |
| Config test surface (workspace) | ~10 workspace-focused cases in 170-line `config.test.ts` | File review | 2026-07-20 |
| `planningRoot` change blast radius | CRITICAL / 15 processes | GitNexus `impact(planningRoot, upstream)` | 2026-07-20 |

### Key Findings
- SC-1/SC-2 are largely met under current names (`workspaceDir`); remaining work is aliasing, messaging, and keeping the gate when semantics are framed as worktree root.
- SC-3 override, SC-4 validator, SC-5/SC-6 Docker+docs are net-new gaps.
- Highest implementation risk is `planningRoot` / Session fan-out — plan must treat slug configurability as a careful config injection, not a broad API rewrite.

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority |
|----|-----|---------------|---------------|--------|----------|
| G1 | Brief worktree-root naming | `--workspace` / `WORKFLOW_WORKSPACE` only | Accept `WORKTREE_ROOT` as env alias into same required field; document mapping | Operator/brief mismatch | HIGH |
| G2 | Configurable planning slug | Hard-coded `PLANNING_RELATIVE_DIR` | `PLANNING_SLUG` (or equivalent) defaulting to `.engineering/artifacts/planning` | Blocks SC-3 override | HIGH |
| G3 | Path containment validator | Module missing | `src/worktree-validator.ts` with resolve + sep-aware (+ realpath) checks | Blocks SC-4 | HIGH |
| G4 | Container worktree volume | No Docker assets | Dockerfile/Compose: RW worktree root; no server-managed global planning volume | Blocks container Phase 1 | HIGH |
| G5 | Agent responsibility docs | README covers workspace bind only | Document create-worktree → init `.engineering` → start with root → `start_session` | Blocks SC-5/SC-6 | MEDIUM |
| G6 | Invented `apply_workflow` root bind | N/A (tool absent) | Must not add; keep startup root + `start_session` | Contradiction risk vs brief | HIGH (avoidance) |
| G7 | Actionable containment errors | N/A until validator exists | Errors guide init / correct root (RE-3) | Agent UX | MEDIUM |

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)
1. **`WORKTREE_ROOT` env alias:** Extend `resolveWorkspaceDir` to read `WORKTREE_ROOT` after CLI / alongside or after `WORKFLOW_WORKSPACE` (precedence to be fixed in plan) — Expected impact: SC-1/brief naming; Effort: small; blast radius LOW.
2. **`/ready` messaging:** Keep existence check; optionally document check key as worktree/workspace root without breaking JSON consumers — Expected impact: SC-2 clarity; Effort: small.

### Structural Improvements (Higher Effort)
1. **Configurable planning slug:** Drive `planningRoot` from config defaulting to current constant — Expected impact: SC-3; Effort: medium; **CRITICAL** call-graph care.
2. **`worktree-validator.ts`:** New module + unit tests for traversal/symlink escape — Expected impact: SC-4; Effort: medium.
3. **Docker/Compose greenfield:** WORKTREE_ROOT volume RW; workflows RO as needed — Expected impact: SC-5/6; Effort: medium; requires CI/CD approval per repo rules.

### Optimization Opportunities
1. **Reuse basename slug bind:** Avoid per-call `worktreeRoot` on tools — Expected impact: SC-7; Effort: docs + light session wiring only.

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria). This document contributes baselines and gaps; analysis-derived targets below map to gap IDs.

| Target | Baseline → Goal | Gap |
|--------|-----------------|-----|
| Env alias | `WORKTREE_ROOT` absent → accepted into required root resolution | G1 |
| Slug override | Constant-only → default + `PLANNING_SLUG` override tested | G2 |
| Containment | 0 validator tests → dedicated suite rejecting `..` / sibling-prefix / symlink escape | G3 |
| Docker | 0 image assets → compose RW worktree root; no global planning volume | G4 |
| Docs | Workspace-only README → agent lifecycle + operator migration notes | G5 |

### Measurement Strategy
**How will we validate improvements?**
- Extend `tests/config.test.ts` for `WORKTREE_ROOT` / slug config (SC-1, SC-3).
- Extend `tests/http-transport.test.ts` for `/ready` with configured root (SC-2).
- New unit tests for `worktree-validator` traversal cases (SC-4).
- Manual/scripted: agent create-worktree → init `.engineering` → session → artifact write without Git in server image (SC-5).
- PR docs checklist for operator + agent runbooks (SC-6); code review for no `apply_workflow`-only root (SC-7).

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| GitNexus `query` / `context` / `impact` on `workflow-server` | Code intelligence | Locate + blast radius (`planningRoot` CRITICAL) |
| `src/config.ts`, `store.ts`, `resource-tools.ts`, `http.ts` | Code | Current bind, planning, session, readiness behaviour |
| `tests/config.test.ts`, `tests/http-transport.test.ts` | Tests | Quantitative fail-fast and `/ready` baselines |
| Glob for Docker / worktree-validator | Repo inventory | Greenfield gaps G3/G4 |
| [Requirements](03-requirements-elicitation.md), [Research](04-kb-research.md), [Assumptions](02-assumptions-log.md) | Planning | Locked decisions + adaptation targets |
| Source brief `/home/mike1/Incoming/phase1_update_agent_worktrees.md` | Design update | Intended architecture (adapt, don’t copy APIs) |

**Status:** Ready for plan-prepare activity
