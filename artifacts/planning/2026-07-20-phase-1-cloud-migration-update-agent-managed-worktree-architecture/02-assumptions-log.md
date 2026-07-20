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
| DP-2a | Design Philosophy | Problem Interpretation | H | Deployments may intentionally use a different planning slug than this monorepo's `.engineering/artifacts/planning/`, so `PLANNING_SLUG` (or equivalent) must be configurable rather than hard-coded to the brief's `.engineering/planning` | — | Open (stakeholder / elicitation — default slug + configurability) |
| DP-3 | Design Philosophy | Complexity Assessment | M | Complexity is complex because the change spans config, tools, HTTP readiness, Docker, and path-validation security with compatibility trade-offs — even though the v3.0 design chooses the direction | User checkpoint `full-workflow`; code fan-out across `config.ts`, `resource-tools.ts`, `store.ts`, `http.ts` | Confirmed |
| DP-4 | Design Philosophy | Workflow Path | L | Full workflow (elicitation + research) is warranted despite a detailed source brief, because brief-to-repo naming/path gaps need discovery before planning | User checkpoint `full-workflow`; DP-1/DP-2 invalidations confirm the gap | Confirmed |
| DP-5 | Design Philosophy | Problem Interpretation | M | A temporary dual-binding path is required so existing local/dev callers do not break when worktree-root binding is introduced — the brief's `PLANNING_FOLDER` name is a stand-in for today's `workspaceDir` planning root | Stakeholder: worktree root is **required at startup**; server must not start / must not be ready without it — rejects optional dual-bind for the root | Confirmed as hard cutover (required `WORKTREE_ROOT` / equivalent); dual-bind for root invalidated |
| DP-6 | Design Philosophy | Workflow Path | M | Agent-managed worktree creation (including `.engineering` submodule init) is accepted as out of server scope for Phase 1 — server only validates and writes | Stakeholder: `/ready` verifies worktree root was **provided at startup** (configured/available), not an optional post-hoc mount; server still does not create Git worktrees | Confirmed — readiness = configured root; agent owns create/init under that root |

## Open Assumptions

### DP-2a: Planning slug default and configurability
**Assumption:** Planning slug must be configurable; the brief's `.engineering/planning` must not silently replace this repo's `.engineering/artifacts/planning/`  
**Decision space:** Default to monorepo convention · default to brief cloud slug · require explicit env with no implicit default  
**Why not code-resolvable:** Cloud container layout may differ from local monorepo by design  
**Technical context:** `PLANNING_RELATIVE_DIR` is a constant today; brief proposes `PLANNING_SLUG` env  
**Agent's position:** Add configurable slug/defaulting that preserves `.engineering/artifacts/planning` for this project unless deployment config overrides  
**Reversibility:** path-committing

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

## Wrap-Up

Design-philosophy + comprehension: 8 rows — 2 confirmed early (complexity/path), 2 invalidated by code (brief tool name; brief planning slug vs `PLANNING_RELATIVE_DIR`), 3 stakeholder-resolved at comprehension-sufficient (DP-1a startup root, DP-5 required root / no dual-bind, DP-6 readiness = configured root), 1 still open for elicitation (DP-2a slug default/configurability). Elicitation inherits: **required startup worktree root + readiness gated on it**; reconcile brief `WORKTREE_ROOT` with repo `workspaceDir` / config parsing; leave planning-slug policy (DP-2a) for requirements.
