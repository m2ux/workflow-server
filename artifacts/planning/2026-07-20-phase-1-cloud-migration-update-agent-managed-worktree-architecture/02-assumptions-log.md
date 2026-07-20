# Assumptions Log

> Phase 1 Cloud Migration Update — Agent-Managed Worktree Architecture · issue skipped · updated 2026-07-20 (assumptions-review)

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
| RS-1 | Research | Pattern Applicability | M | `WORKTREE_ROOT` can be accepted as an env alias into the same required `workspaceDir` field (keeping `--workspace` / `WORKFLOW_WORKSPACE`) without introducing a second optional root — rationale: matches brief naming while preserving hard cutover (DP-5) and existing fail-fast config | Research: [04-kb-research.md](04-kb-research.md) RC-1; Code: `resolveWorkspaceDir` in `src/config.ts` | Validated |
| RS-2 | Research | Pattern Applicability | L | Path containment in `worktree-validator` should use resolve + `root + path.sep` (and `realpath` when symlinks can escape) — rationale: Node path APIs trust input; community/official guidance rejects join/normalize-as-sanitization | Research: [04-kb-research.md](04-kb-research.md) RC-2; web Node path-traversal guides | Validated |
| RS-3 | Research | Synthesis Decisions | M | Phase 1 deploys one server process bound to one worktree/monorepo root; multi-worktree-per-process via per-call `worktreeRoot` stays out of scope — rationale: locked startup-only root + current `planningRoot(workspaceDir)` model | Research: [04-kb-research.md](04-kb-research.md) RC-3; locked DP-1a/RE-2 | Validated |
| RS-4 | Research | Source Relevance | L | Concept-rag KB gap on Node path security / K8s probes is acceptable — repo patterns plus current official/web docs sufficiently inform planning — rationale: identify-patterns/practices returned little domain match; repo is authoritative for adaptation | Research: [04-kb-research.md](04-kb-research.md) Research Approach KB gap note | Validated |
| IA-1 | Implementation Analysis | Current Behavior | L | No dedicated worktree/path-containment module exists today; `start_session` already ignores agent `planning_folder` path beyond basename, so root escape via that hint is not a current hole — Phase 1 still needs `worktree-validator` for derived/verified paths under the configured root | Code: no `src/worktree-validator.ts`; `resource-tools.ts` basename-as-slug; grep shows no sep-aware containment helper | Validated |
| IA-2 | Implementation Analysis | Gap Identification | M | Docker/Compose for a worktree-root volume do not exist in this repo yet — Phase 1 adds them greenfield (not a patch of an existing image) | Code: glob for `Dockerfile*` / `docker-compose*` under reference and target worktrees returned 0 | Validated |
| IA-3 | Implementation Analysis | Baseline Interpretation | M | Existing fail-fast `WorkspaceConfigError` + `/ready` `workspaceDir` existence check already implement the hard-cutover readiness pattern for SC-1/SC-2; Phase 1 extends naming (`WORKTREE_ROOT` alias), slug config, validator, Docker, and docs rather than inventing readiness from scratch | Code: `resolveWorkspaceDir` / `registerHealthRoutes`; tests in `config.test.ts` and `http-transport.test.ts` | Validated |
| IA-4 | Implementation Analysis | Dependency Understanding | H | Making planning slug configurable must preserve `planningRoot(workspaceDir)` call-site shape — GitNexus upstream impact on `planningRoot` is CRITICAL (15 processes / Session+tools fan-out); inject slug via config or module default, avoid signature churn | Code: GitNexus `impact(planningRoot, upstream)` CRITICAL; callers `ensurePlanningFolder`, `findPlanningFolderBySlug`, `resolveSessionLocation`, tests | Validated |
| IA-5 | Implementation Analysis | Current Behavior | L | Neither `WORKTREE_ROOT` nor `PLANNING_SLUG` env vars exist in `loadConfig` today — only `--workspace` / `WORKFLOW_WORKSPACE` and hard-coded `PLANNING_RELATIVE_DIR` | Code: `src/config.ts` `resolveWorkspaceDir`; `store.ts` `PLANNING_RELATIVE_DIR` | Validated |
| PL-1 | Planning | Design Approach | L | Env precedence for the required root is CLI `--workspace` > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT` — extends the existing CLI > env pattern without inventing a second optional root | Plan: [06-work-package-plan.md](06-work-package-plan.md) Task 2; mirrors `resolveWorkspaceDir` today | Open (validate in Task 2 tests) |
| PL-2 | Planning | Design Approach | H | Planning slug is injected via startup-set module/config default so `planningRoot(workspaceDir)` keeps a one-arg signature — avoids CRITICAL call-graph churn (IA-4) | Plan Task 3; GitNexus `impact(planningRoot)` CRITICAL | Open (validate in Task 3 / typecheck) |
| PL-3 | Planning | Scope Decisions | M | `/ready` JSON keeps `checks.workspaceDir` (document as worktree root) rather than renaming the check key in Phase 1 — preserves HTTP consumers | Plan Task 5; existing `http-transport.test.ts` contract | Open (validate in Task 5) |
| PL-4 | Planning | Task Breakdown | M | Containment is enforced at planning write/ensure entry points (`ensurePlanningFolder` and equivalent) first; exhaustive audit of every path read is out of Phase 1 unless a write path is found during impl | Plan Task 4; IA-1 basename-slug already limits session hint escape | Open (validate in Task 4) |
| PL-5 | Planning | Test Strategy | L | Pre-implementation test plan uses non-hyperlinked `PR267-TC-*` IDs; source links are added after implementation per test-plan lifecycle | Plan: [06-test-plan.md](06-test-plan.md); technique lifecycle-phases | Open (finalize-documentation) |
| PL-6 | Planning | Dependency Assumptions | M | Greenfield `Dockerfile` / Compose are in-scope for this work package (IA-2) and do not require a separate ops ticket before implementation — CI/CD approval remains a PR review concern | Requirements scope item 8; IA-2 | Open (PR #267 review) |
| PL-7 | Planning | Scope Decisions | M | `src/worktree-validator.ts` is **containment only** (path-inside-root / traversal safety) — it does not create, list, or remove Git worktrees or init `.engineering`; agent owns lifecycle | User at `approach-confirmed` → `confirmed` (2026-07-20); plan Task 1 scope boundary | Confirmed |
| AR-1 | Assumptions Review | Scope Decisions | L | No significant assumptions (planning residuals PL-1…PL-6 remain implementation-/PR-review-validatable; locked clarifications cover validator containment-only, `planningRoot` signature freeze, required startup root, and PLANNING_SLUG default — no new stakeholder-dependent residue at assumptions-review) | Log + approach/elicitation locks | Validated — null collect |

## Open Assumptions

*(none — PL-1…PL-6 are implementation- or review-validatable; PL-7 confirmed at approach checkpoint; AR-1 null collect; no stakeholder-dependent residue)*

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

## Research-Resolved (2026-07-20)

### RS-1: Env alias surface
**Decision:** Prefer `WORKTREE_ROOT` as an env alias into the same required `workspaceDir` resolution; keep `--workspace` / `WORKFLOW_WORKSPACE`; document brief mapping. Optional flag rename deferred to plan — not a reopen of required-root.

### RS-2: Validator containment algorithm
**Decision:** Implement resolve + sep-aware containment, with `realpath` when validating paths that may involve symlinks.

### RS-3: Multiplicity model
**Decision:** One configured root per process for Phase 1; per-call multi-worktree root remains out of scope.

## Implementation-Analysis-Resolved (2026-07-20)

### IA-1…IA-5: Current baselines and gaps
**Decision:** Code-validated — no path-containment module or Docker assets yet; fail-fast/`/ready` already cover required-root readiness under `workspaceDir` names; `planningRoot` changes are CRITICAL blast radius; `WORKTREE_ROOT`/`PLANNING_SLUG` absent today.  
**Captured in:** [implementation analysis](05-implementation-analysis.md).  
**User:** Checkpoint `analysis-confirmed` → `confirmed` (2026-07-20) — analysis artifact accepted; no open IA assumptions required interview.

## Plan-Prepare Notes (2026-07-20)

### PL-1…PL-6: Planning decisions
**Decision:** Selected Option A (env alias + inject slug without `planningRoot` signature change); rejected rename of `workspaceDir`, inventing `apply_workflow`, and widening `planningRoot` arity. PL rows track precedence, injection strategy, `/ready` check-key stability, validator wiring scope, test-plan link lifecycle, and Docker greenfield inclusion — all code/review resolvable.  
**Captured in:** [work package plan](06-work-package-plan.md), [test plan](06-test-plan.md).

### PL-7: Validator containment-only (approach confirmed)
**Decision:** User confirmed approach with clarification that `worktree-validator` is path-containment / traversal safety only — not broader worktree lifecycle ownership. Reflected in plan Task 1 scope boundary and test-plan overview.  
**Checkpoint:** `approach-confirmed` → `confirmed` (2026-07-20).

## Assumptions-Review (2026-07-20)

### AR-1: Residual stakeholder scan
**Decision:** Null collect at assumptions-review — no new implicit decisions beyond locked clarifications and PL/IA/RE/DP/RS rows. Analyse-challenge loop not entered (`has_resolvable_assumptions: false`; empty stakeholder open set). Interview/batch skipped.  
**Gates:** `has_open_assumptions: false`; `has_deferred_assumptions: false`.

## Wrap-Up

29 assumptions — 22 validated/confirmed (incl. AR-1 null); PL-1…PL-6 remain open for impl/PR-review validation only. No stakeholder-dependent open residue; no deferred items.
