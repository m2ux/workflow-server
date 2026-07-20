# Test Plan: Phase 1 Agent-Managed Worktree Architecture

> **ADR:** — · **Ticket:** — (skipped) · **PR:** [#267](https://github.com/m2ux/workflow-server/pull/267)

## Overview

This test plan validates required worktree-root startup (including `WORKTREE_ROOT` alias), configurable planning slug, path containment, `/ready` gating, and the documented agent bind path — without inventing an `apply_workflow` root surface.

Key changes to validate:
1. `resolveWorkspaceDir` / `loadConfig` — `WORKTREE_ROOT` alias and fail-fast
2. `planningRoot` / planning relative dir — default + `PLANNING_SLUG` override (signature preserved)
3. `worktree-validator` — resolve + sep-aware (+ realpath) containment
4. `registerHealthRoutes` `/ready` — configured root present
5. Agent/operator contract — docs + session slug bind (no per-call root)

## Test Cases

| <div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div> |
|---|---|---|---|---|
| PR267-TC-01 | Verify server config fails fast when no workspace/`WORKTREE_ROOT` source is set | 1. Clear `--workspace`, `WORKFLOW_WORKSPACE`, and `WORKTREE_ROOT`  <br>2. Invoke `loadConfig` / workspace resolution  <br>3. Capture thrown error | Throws `WorkspaceConfigError`; message lists CLI and both env names; no cwd fallback | Unit |
| PR267-TC-02 | Verify `WORKTREE_ROOT` alone satisfies the required root bind | 1. Unset CLI and `WORKFLOW_WORKSPACE`  <br>2. Set `WORKTREE_ROOT` to an absolute temp path  <br>3. Resolve workspace dir | Resolved `workspaceDir` equals the absolute `WORKTREE_ROOT` path | Unit |
| PR267-TC-03 | Verify precedence CLI > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT` | 1. Provide all three sources with distinct paths  <br>2. Resolve workspace  <br>3. Repeat with CLI omitted, then with only `WORKTREE_ROOT` | Highest-precedence source wins in each case | Unit |
| PR267-TC-04 | Verify default planning relative dir remains `.engineering/artifacts/planning` | 1. Load config without `PLANNING_SLUG`  <br>2. Compute `planningRoot(workspaceDir)` | Join equals `{workspaceDir}/.engineering/artifacts/planning` | Unit |
| PR267-TC-05 | Verify `PLANNING_SLUG` override changes derived planning root | 1. Set `PLANNING_SLUG=.engineering/planning`  <br>2. Load config / set active relative dir  <br>3. Call `planningRoot` | Join equals `{workspaceDir}/.engineering/planning`; empty/whitespace slug falls back to default | Unit |
| PR267-TC-06 | Verify `planningRoot(workspaceDir)` call signature is unchanged for callers | 1. Inspect call sites / typecheck  <br>2. Run session-store tests that call `planningRoot` with one argument | Existing one-arg callers compile and pass; no required second parameter | Unit |
| PR267-TC-07 | Verify path containment rejects `..` traversal outside the root | 1. Choose a temp root  <br>2. Candidate = `join(root, '..', 'escape')` (or equivalent)  <br>3. Call validator | Rejects; error is actionable (mentions root / init guidance) | Unit |
| PR267-TC-08 | Verify sibling-prefix paths are rejected (`/uploads` vs `/uploads-evil`) | 1. Root = `/tmp/uploads`  <br>2. Candidate = `/tmp/uploads-evil/x`  <br>3. Call validator | Rejects (sep-aware check, not string prefix alone) | Unit |
| PR267-TC-09 | Verify symlink escape is rejected when realpath leaves the root | 1. Create root and a symlink pointing outside  <br>2. Validate the symlink path under root  <br>3. Observe result | Rejects after realpath; in-root real paths accepted | Unit |
| PR267-TC-10 | Verify `/ready` returns 503 when configured workspace/worktree root is missing | 1. Build HTTP app with `workspaceDir` pointing at a non-existent path  <br>2. GET `/ready` | HTTP 503; `status: not-ready`; workspace/root check false | Integration |
| PR267-TC-11 | Verify `/ready` returns 200 when worktree root (via `WORKTREE_ROOT`-backed config) and other dirs exist | 1. Create temp dirs for workflow, schemas, workspace  <br>2. Config with those paths  <br>3. GET `/ready` and `/health` | `/ready` 200 with checks true; `/health` 200 regardless of root | Integration |
| PR267-TC-12 | Verify `ensurePlanningFolder` / write path fails closed on escaped candidates | 1. Configure valid root + slug  <br>2. Attempt ensure/write with a path that escapes root (if API allows)  <br>3. Observe error | Operation fails; no directory created outside root | Integration |
| PR267-TC-13 | Verify session bind stays slug-hint based (no per-call worktree root tool param) | 1. Inventory tool schemas for new `worktreeRoot` / `apply_workflow` root bind  <br>2. `start_session` with absolute `planning_folder` path  <br>3. Inspect resolved planning folder | No invent-only root tool; basename slug resolves under configured planning root | Integration |
| PR267-TC-14 | Verify agent lifecycle path without Git in the server image | 1. On host: create worktree under root; init `.engineering`  <br>2. Start server with `WORKTREE_ROOT` (container or local) without Git installed in server env  <br>3. `start_session` + write a planning artifact | Session and artifact write succeed; server process never invokes Git | Manual |
| PR267-TC-15 | Verify operator docs describe required root, slug default/override, and agent responsibilities | 1. Read README/SETUP (and Compose notes)  <br>2. Checklist: required root names; default slug; `PLANNING_SLUG`; agent steps; no `apply_workflow` root | All checklist items present and accurate vs code | Manual |

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| SC-1 | Server refuses ready / fails fast without worktree root | PR267-TC-01, PR267-TC-10 |
| SC-2 | With valid root, `/ready` reports ready | PR267-TC-11 |
| SC-3 | Default planning path `{root}/.engineering/artifacts/planning`; override via `PLANNING_SLUG` | PR267-TC-04, PR267-TC-05, PR267-TC-06 |
| SC-4 | Paths outside configured root rejected | PR267-TC-07, PR267-TC-08, PR267-TC-09, PR267-TC-12 |
| SC-5 | Agent create-worktree → init → session → write without server Git | PR267-TC-13, PR267-TC-14 |
| SC-6 | Operator/agent docs cover required root and responsibilities | PR267-TC-15 |
| SC-7 | No `apply_workflow`-only root bind | PR267-TC-13 |

## Running Tests

```bash
# All tests (from repo / feature worktree root)
npm test

# Config / workspace bind
npm test -- --grep "workspace|WORKTREE_ROOT|PLANNING_SLUG"

# Validator module (once added)
npm test -- --grep "worktree-validator"

# HTTP readiness
npm test -- --grep "ready|http-transport"

# Typecheck after planningRoot-adjacent changes
npm run typecheck
```

*Source hyperlinks on Test IDs and Overview symbols will be added after implementation (finalize-documentation).*
