# Phase 1 Agent-Managed Worktree Architecture - Implementation Plan

> plan · HIGH · Ready · 2-3h agentic + 1h review · 2026-07-20 · approach confirmed

## Overview

### Problem & Scope
Problem, scope, and success criteria: [requirements](03-requirements-elicitation.md).

## Inputs

- [Knowledge Base Research](04-kb-research.md#recommended-approach) — adapt `workspaceDir` + slug-hint `start_session`; resolve-then-contain validator; RW bind for host worktrees
- [Implementation Analysis](05-implementation-analysis.md#gap-analysis) — G1–G7 gaps; SC-1/SC-2 largely met under current names; `planningRoot` CRITICAL blast radius
- [Design Philosophy](02-design-philosophy.md#problem-classification) — inventive improvement; agent owns Git lifecycle; server validates and writes

## Proposed Approach

### Solution Design

Keep the existing required startup bind (`ServerConfig.workspaceDir`) as the Phase 1 worktree/workspace root. Accept brief `WORKTREE_ROOT` as an env alias into the same resolver (CLI `--workspace` > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT`). Make the planning relative segment configurable via `PLANNING_SLUG` while **preserving** `planningRoot(workspaceDir)`’s call-site signature (GitNexus upstream: CRITICAL — 15 processes; d=1: `ensurePlanningFolder`, `findPlanningFolderBySlug`, `resolveSessionLocation`). Add greenfield `src/worktree-validator.ts` for **path containment only** (resolve + sep-aware + realpath traversal safety — not Git worktree create/list/remove or other lifecycle ownership; the agent owns that). Leave `/ready` gated on `workspaceDir` existence. Add Docker/Compose with RW worktree-root bind (no server-managed global planning volume). Document agent lifecycle and operator migration. Do **not** invent `apply_workflow` or per-call root.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| A. Env alias + inject slug without changing `planningRoot` signature | Minimal blast radius; meets SC-1–SC-7; reuses fail-fast/`/ready` | Brief names stay aliases, not renames | **Selected** |
| B. Rename `workspaceDir` → `worktreeRoot` across API | Matches brief literally | Wide rename churn; breaks tests/docs/scripts | Rejected |
| C. Per-call `worktreeRoot` on tools / invent `apply_workflow` | Matches brief §3.2 | Contradicts DP-1a/RE-2/SC-7; CRITICAL fan-out | Rejected |
| D. Change `planningRoot` to take slug param everywhere | Explicit config plumbing | Signature churn on CRITICAL symbol | Rejected — inject relative dir via module/config default |

### Assumptions
Assumptions underlying the approach: [assumptions log](02-assumptions-log.md).

## Implementation Tasks

### Task 1: Path-containment validator module (25-40 min)
**Goal:** Greenfield **containment-only** helper for SC-4 / G3 (path inside configured root; reject traversal/escape).  
**Scope boundary:** This module does **not** own worktree lifecycle (no create/add/remove/list, no Git, no `.engineering` init). Filename `worktree-validator` means “validate paths under the worktree root,” not “manage worktrees.”  
**Depends on:** none (leaf).  
**Deliverables:**
- `src/worktree-validator.ts` — `assertPathInsideRoot(root, candidate)` (and planning-path helper): absolute resolve, optional `realpath`, reject if not `root` or `root + sep` prefix; actionable errors (RE-3 / G7)
- `tests/worktree-validator.test.ts` — `..` traversal, sibling-prefix (`/uploads` vs `/uploads-evil`), symlink escape when feasible

### Task 2: `WORKTREE_ROOT` env alias into required workspace bind (15-25 min)
**Goal:** Brief naming without second optional root (G1 / RS-1).  
**Depends on:** none (leaf; GitNexus `resolveWorkspaceDir` LOW).  
**Deliverables:**
- `src/config.ts` — after CLI and `WORKFLOW_WORKSPACE`, accept `WORKTREE_ROOT`; update `WorkspaceConfigError` message to mention all three; keep hard throw (no cwd)
- `tests/config.test.ts` — alias alone succeeds; precedence CLI > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT`; missing all three still throws
- Operator-facing note in error string / comment that `workspaceDir` **is** the configured worktree root

### Task 3: Configurable `PLANNING_SLUG` without `planningRoot` signature churn (30-45 min)
**Goal:** SC-3 / G2 / IA-4 — default `.engineering/artifacts/planning`; override via env.  
**Depends on:** Task 2 (config surface).  
**Blast radius:** `planningRoot` CRITICAL — keep `(workspaceDir: string)`; drive relative segment from config-set module default or env read with constant fallback (`PLANNING_RELATIVE_DIR` remains the default literal).  
**Deliverables:**
- `src/config.ts` — resolve `PLANNING_SLUG` (trim; empty → default); expose on `ServerConfig` (e.g. `planningRelativeDir`)
- `src/utils/session/store.ts` — `planningRoot` joins active relative dir; `createServer` / `loadConfig` path sets active dir once at startup (prefer explicit set over scattered `process.env` reads in hot paths)
- `tests/config.test.ts` + `tests/session-store.test.ts` — default unchanged; override changes derived root; empty/whitespace slug falls back to default

### Task 4: Wire containment checks into planning-path derivation (20-30 min)
**Goal:** Apply Task 1 containment (only) on derived/ensured planning paths (SC-4).  
**Depends on:** Tasks 1 and 3.  
**Deliverables:**
- Call the containment helper from `ensurePlanningFolder` (and any other write-path entry that materialises folders under the root) so escaped or non-descendant paths fail closed — no lifecycle APIs added here
- Keep `start_session` basename-slug behaviour (no per-call root); root remains startup-only (SC-7 / G6)

### Task 5: Confirm `/ready` worktree-root gate (10-15 min)
**Goal:** SC-2 / G1 messaging; preserve existing check (IA-3).  
**Depends on:** Task 2.  
**GitNexus:** `registerHealthRoutes` LOW.  
**Deliverables:**
- `src/transports/http.ts` — keep existence check on configured `workspaceDir`; clarify in comments/docs that this field is the worktree root; avoid breaking JSON consumers of `checks.workspaceDir` unless a compatible alias is explicitly chosen in implementation
- `tests/http-transport.test.ts` — retain 200/503 coverage; add case that server started with `WORKTREE_ROOT`-only still gates ready

### Task 6: Docker / Compose worktree-root volume (25-40 min)
**Goal:** G4 / SC-5–SC-6 container layout (greenfield).  
**Depends on:** Tasks 2–3 (env contract).  
**Deliverables:**
- `Dockerfile` — Node image; no Git/SSH; `ENV WORKTREE_ROOT=...` (and optional example `PLANNING_SLUG`); no global planning volume mkdir
- `docker-compose.yml` (or equivalent) — RW bind of host worktree root; workflows/schemas as needed (RO where appropriate)
- Brief comment/README pointer: UID/GID alignment for agent-created trees

### Task 7: Agent responsibility + operator migration docs (20-30 min)
**Goal:** SC-5 / SC-6 / G5.  
**Depends on:** Tasks 2–6 (contract stable).  
**Deliverables:**
- `README.md` / `SETUP.md` (and/or short `docs/` note) — agent sequence: identify repo → `git worktree add` under root → init `.engineering` → start server with required root → `start_session` with planning slug/folder hint → artifact writes
- Operator migration: required root (`--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT`); default planning slug; how to override `PLANNING_SLUG`; no `apply_workflow` root bind

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria); baselines and measurement: [implementation analysis](05-implementation-analysis.md#baseline-metrics). Task-level acceptance (gap-linked only):
- G1/G2: alias + slug override covered in config/store tests
- G3/G7: validator suite rejects traversal/sibling-prefix; errors actionable
- G4/G5: Compose RW root + docs checklist on PR #267
- G6: code review — no new `apply_workflow`-only root

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md). Ordering constraint: implement/validator unit tests before store wiring tests; HTTP ready tests after config alias exists.

## Dependencies & Risks

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| `planningRoot` fan-out if signature changes | HIGH | MEDIUM | Inject relative dir; keep signature; regression on session-store tests |
| Brief docs drift (`apply_workflow`, cloud slug default) | MEDIUM | HIGH | Docs + plan explicitly adapt; default monorepo path |
| Symlink escape missed | HIGH | LOW | realpath in validator; dedicated tests |
| Docker UID mismatch on RW bind | MEDIUM | MEDIUM | Document host UID alignment in Compose notes |

**Status:** Ready for implementation
