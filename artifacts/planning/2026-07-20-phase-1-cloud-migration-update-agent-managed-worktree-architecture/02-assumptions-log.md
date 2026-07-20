# Assumptions Log

> Phase 1 Cloud Migration Update — Agent-Managed Worktree Architecture · issue skipped · updated 2026-07-20

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | H | The brief's `apply_workflow` + `worktreeRoot` API maps onto this repository's real tool surface — the update document names that tool as the integration point | Code: no `apply_workflow` in `src/tools/*.ts`; session/planning entry is `start_session` with optional `planning_folder` hint (`src/tools/resource-tools.ts`); workspace binding is `ServerConfig.workspaceDir` (`src/config.ts`) | Invalidated — literal tool mapping fails; adaptation target became DP-1a |
| DP-1a | Design Philosophy | Problem Interpretation | H | `worktreeRoot` should bind by extending an existing entry point (`start_session` / workspace config) rather than introducing a new `apply_workflow` tool named in the brief | Stakeholder (comprehension-sufficient): worktree root is a **required server startup argument** (CLI/config), aligned with brief `WORKTREE_ROOT` — not an `apply_workflow`-only or per-call-only root surface | Confirmed — startup config bind |
| DP-2 | Design Philosophy | Problem Interpretation | H | `PLANNING_SLUG=.engineering/planning` is the correct derived planning path under a worktree — matches the brief's derivation formula | Code: `PLANNING_RELATIVE_DIR = '.engineering/artifacts/planning'` in [`src/utils/session/store.ts`](../../../../../src/utils/session/store.ts) (`planningRoot`); `/ready` checks `workspaceDir` existence (`src/transports/http.ts`) | Invalidated for this repo's current convention — cloud slug vs monorepo path remains a product choice (DP-2a) |
| DP-2a | Design Philosophy | Problem Interpretation | H | Deployments may intentionally use a different planning slug than this monorepo's `.engineering/artifacts/planning/`, so `PLANNING_SLUG` (or equivalent) must be configurable rather than hard-coded to the brief's `.engineering/planning` | User/elicitation (prefer repo truth): default slug = `.engineering/artifacts/planning`; keep slug configurable so brief’s `.engineering/planning` is an explicit override only | Confirmed — default monorepo path; override via config |
| DP-3 | Design Philosophy | Complexity Assessment | M | Complexity is complex because the change spans config, tools, HTTP readiness, Docker, and path-validation security with compatibility trade-offs — even though the v3.0 design chooses the direction | User checkpoint `full-workflow`; code fan-out across `config.ts`, `resource-tools.ts`, `store.ts`, `http.ts` | Confirmed |
| DP-4 | Design Philosophy | Workflow Path | L | Full workflow (elicitation + research) is warranted despite a detailed source brief, because brief-to-repo naming/path gaps need discovery before planning | User checkpoint `full-workflow`; DP-1/DP-2 invalidations confirm the gap | Confirmed |
| DP-5 | Design Philosophy | Problem Interpretation | M | A temporary dual-binding path is required so existing local/dev callers do not break when worktree-root binding is introduced — the brief's `PLANNING_FOLDER` name is a stand-in for today's `workspaceDir` planning root | Stakeholder: worktree root is **required at startup**; server must not start / must not be ready without it — rejects optional dual-bind for the root | Confirmed as hard cutover (required `WORKTREE_ROOT` / equivalent); dual-bind for root invalidated |
| DP-6 | Design Philosophy | Workflow Path | M | Agent-managed worktree creation (including `.engineering` submodule init) is accepted as out of server scope for Phase 1 — server only validates and writes | Stakeholder: `/ready` verifies worktree root was **provided at startup** (configured/available), not an optional post-hoc mount; server still does not create Git worktrees | Confirmed — readiness = configured root; agent owns create/init under that root |
| RE-1 | Requirements Elicitation | Requirement Interpretation | M | Today’s required `workspaceDir` (`--workspace` / `WORKFLOW_WORKSPACE`) is the adaptation target for brief `WORKTREE_ROOT` — rename/semantics may evolve in research/plan, but the *requirement* is one required startup root bind, not a second parallel optional root | Elicitation from locked DP-1a + `src/config.ts` WorkspaceConfigError behaviour | Confirmed — single required startup root surface |
| RE-2 | Requirements Elicitation | Scope Boundaries | M | Per-session planning bind (which folder under the root) stays on `start_session` / `planning_folder` / returned `planning_folder_path` patterns; Phase 1 does not invent `apply_workflow` as the root or sole planning bind | Brief vs repo tools (DP-1); elicitation scope | Confirmed |
| RE-3 | Requirements Elicitation | Implicit Requirements | L | Path-containment errors must be actionable for agents (guide init of `.engineering` / correct root) — brief risk table | Elicitation from brief §8 risks | Confirmed as success/quality expectation (SC-4/SC-5) |
| RE-4 | Requirements Elicitation | Success Criteria Interpretation | M | SC-3 default slug `.engineering/artifacts/planning` is the measurable expression of DP-2a — cloud layouts override only via explicit `PLANNING_SLUG` | DP-2a confirmation + store.ts constant | Confirmed |

## Open Assumptions

*(none — DP-2a closed in elicitation; no stakeholder-dependent residue)*

## Stakeholder-Resolved (comprehension-sufficient · 2026-07-20)

### DP-1a: Where the worktree root binds
**Decision:** Worktree root is a **server startup argument** (CLI/config), required for process start — aligned with brief `WORKTREE_ROOT` (§4/§5), not invented as a separate runtime-only concern and not an `apply_workflow`-only surface for the *root*.  
**Inheritance for elicitation:** Requirements must treat required startup worktree-root config as in-scope; map onto today's `workspaceDir` / `--workspace` / `WORKFLOW_WORKSPACE` surface as the adaptation target.

### DP-5: Migration / dual-binding of the root
**Decision:** Hard cutover for the root — worktree root is **required**; server must not start and must not report ready without it. Temporary dual-binding of an optional legacy root is out.  
**Inheritance for elicitation:** Success criteria include fail-fast startup and readiness when the root is missing; document operator migration from today's workspace bind to required worktree root.

### DP-6: Readiness and agent Git ownership
**Decision:** The readiness check **is** "worktree root was provided at startup (configured / available)" — not an optional post-hoc mount check. Agent still owns Git worktree create and `.engineering` init under that root; server validates and writes.  
**Inheritance for elicitation:** `/ready` contract = configured worktree root present; agent operational steps remain client-side.

## Elicitation-Resolved (2026-07-20)

### DP-2a: Planning slug default and configurability
**Decision:** Default planning slug is **`.engineering/artifacts/planning`** (monorepo / `PLANNING_RELATIVE_DIR` truth). Keep slug **configurable** so deployments may set the brief’s `.engineering/planning` (or another layout) explicitly — never silently replace the repo default.  
**Captured in:** [requirements](03-requirements-elicitation.md) scope item 5 and SC-3.

## Wrap-Up

Design-philosophy + elicitation: 12 rows — prior DP set retained; DP-2a confirmed (repo-default slug + configurability); RE-1…RE-4 recorded and confirmed from agent-led elicitation (stakeholder transcript skipped). No open assumptions remain for interview. Research next can detail rename/`WORKTREE_ROOT` vs `workspaceDir` mechanics without reopening the required-root or default-slug product decisions.
