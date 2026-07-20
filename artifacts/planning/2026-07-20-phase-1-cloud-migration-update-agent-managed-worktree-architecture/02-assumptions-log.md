# Assumptions Log

> Phase 1 Cloud Migration Update — Agent-Managed Worktree Architecture · issue skipped · updated 2026-07-20

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | H | The brief's `apply_workflow` + `worktreeRoot` API maps onto this repository's real tool surface — the update document names that tool as the integration point | Code: no `apply_workflow` in `src/tools/*.ts`; session/planning entry is `start_session` with optional `planning_folder` hint (`src/tools/resource-tools.ts`); workspace binding is `ServerConfig.workspaceDir` (`src/config.ts`) | Invalidated — literal tool mapping fails; adaptation target remains open as DP-1a |
| DP-1a | Design Philosophy | Problem Interpretation | H | `worktreeRoot` should bind by extending an existing entry point (`start_session` / workspace config) rather than introducing a new `apply_workflow` tool named in the brief | — | Open (stakeholder / elicitation — API shape) |
| DP-2 | Design Philosophy | Problem Interpretation | H | `PLANNING_SLUG=.engineering/planning` is the correct derived planning path under a worktree — matches the brief's derivation formula | Code: `PLANNING_RELATIVE_DIR = '.engineering/artifacts/planning'` in [`src/utils/session/store.ts`](../../../../../src/utils/session/store.ts) (`planningRoot`); `/ready` checks `workspaceDir` existence (`src/transports/http.ts`) | Invalidated for this repo's current convention — cloud slug vs monorepo path remains a product choice (DP-2a) |
| DP-2a | Design Philosophy | Problem Interpretation | H | Deployments may intentionally use a different planning slug than this monorepo's `.engineering/artifacts/planning/`, so `PLANNING_SLUG` (or equivalent) must be configurable rather than hard-coded to the brief's `.engineering/planning` | — | Open (stakeholder / elicitation — default slug + configurability) |
| DP-3 | Design Philosophy | Complexity Assessment | M | Complexity is complex because the change spans config, tools, HTTP readiness, Docker, and path-validation security with compatibility trade-offs — even though the v3.0 design chooses the direction | User checkpoint `full-workflow`; code fan-out across `config.ts`, `resource-tools.ts`, `store.ts`, `http.ts` | Confirmed |
| DP-4 | Design Philosophy | Workflow Path | L | Full workflow (elicitation + research) is warranted despite a detailed source brief, because brief-to-repo naming/path gaps need discovery before planning | User checkpoint `full-workflow`; DP-1/DP-2 invalidations confirm the gap | Confirmed |
| DP-5 | Design Philosophy | Problem Interpretation | M | A temporary dual-binding path is required so existing local/dev callers do not break when worktree-root binding is introduced — the brief's `PLANNING_FOLDER` name is a stand-in for today's `workspaceDir` planning root | Code: there is no `PLANNING_FOLDER` env today; planning root is `workspaceDir` + `PLANNING_RELATIVE_DIR` | Open (stakeholder — migration/deprecation policy for `workspaceDir` vs `worktreeRoot`) |
| DP-6 | Design Philosophy | Workflow Path | M | Agent-managed worktree creation (including `.engineering` submodule init) is accepted as out of server scope for Phase 1 — server only validates and writes | Brief §6 Agent Responsibilities; aligns with removing Git from the image | Open (stakeholder — confirm operational contract across MCP clients) |

## Open Assumptions

### DP-1a: Where `worktreeRoot` binds
**Assumption:** `worktreeRoot` should extend an existing entry point rather than adding a literal `apply_workflow` tool  
**Decision space:** Extend `start_session` / workspace binding · add a dedicated worktree-bind tool · introduce `apply_workflow` as a new cloud-facing alias  
**Why not code-resolvable:** Product/API contract for cloud agents vs preserving current MCP surface  
**Technical context:** Code invalidates the brief's tool name; `start_session` already accepts an absolute `planning_folder` hint and resolves against `workspaceDir`  
**Agent's position:** Prefer extending workspace/`start_session` binding with validation helpers (`worktree-validator`) unless cloud clients already depend on an `apply_workflow` name from the Phase 1 plan set  
**Reversibility:** path-committing

### DP-2a: Planning slug default and configurability
**Assumption:** Planning slug must be configurable; the brief's `.engineering/planning` must not silently replace this repo's `.engineering/artifacts/planning/`  
**Decision space:** Default to monorepo convention · default to brief cloud slug · require explicit env with no implicit default  
**Why not code-resolvable:** Cloud container layout may differ from local monorepo by design  
**Technical context:** `PLANNING_RELATIVE_DIR` is a constant today; brief proposes `PLANNING_SLUG` env  
**Agent's position:** Add configurable slug/defaulting that preserves `.engineering/artifacts/planning` for this project unless deployment config overrides  
**Reversibility:** path-committing

### DP-5: Migration dual-binding
**Assumption:** Temporary dual-binding (`workspaceDir` legacy vs `worktreeRoot` new) is required during transition  
**Decision space:** Hard cutover · dual-read with clear errors · longer deprecation window  
**Why not code-resolvable:** Operator migration policy  
**Technical context:** Brief's `PLANNING_FOLDER` fallback does not exist as named today; legacy surface is `workspaceDir`  
**Agent's position:** Dual-read with explicit errors when neither binding yields a valid planning root  
**Reversibility:** easily-reversible

### DP-6: Agent owns Git lifecycle
**Assumption:** Server never creates worktrees or runs Git; agent always does so before calling the server  
**Decision space:** Strict agent-only · server helper for init · hybrid  
**Why not code-resolvable:** Operational contract across MCP clients  
**Technical context:** Brief §2–§6; `/ready` today only checks `workflowDir`/`schemasDir`/`workspaceDir`  
**Agent's position:** Strict agent-only for Phase 1, with validation errors that tell the agent exactly what to run  
**Reversibility:** path-committing

## Wrap-Up

Design-philosophy pass: 8 rows — 2 confirmed (complexity/path), 2 invalidated (brief tool name; brief planning slug vs `PLANNING_RELATIVE_DIR`), 4 open for elicitation (API binding, slug policy, migration dual-binding, agent Git ownership). Pattern: the source brief describes the intended architecture correctly, but its concrete API/path names do not match this repository's current surface — elicitation must reconcile brief vocabulary with `workspaceDir` / `start_session` / `.engineering/artifacts/planning`.
