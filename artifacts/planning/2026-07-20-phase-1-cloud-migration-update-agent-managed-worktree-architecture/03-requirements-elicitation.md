# Requirements Elicitation: Phase 1 Cloud Migration Update — Agent-Managed Worktree Architecture

> 2026-07-20 · Confirmed

## Problem Statement

Phase 1 containerisation still assumes the workflow server owns a global planning folder and would take on Git worktree and project lifecycle work. That couples the server to credentials, Git tooling, and a shared planning volume, blocking a thin, stateless container and preventing per-project artifact isolation. The agent must own worktree creation and `.engineering` initialisation; the server must accept a required worktree root at startup, derive planning paths under that root, validate them, and write artifacts — without inventing APIs that contradict this repository’s real tool surface.

## Goal

Operators and agents can run the workflow server against agent-managed worktrees under a required startup worktree root, with readiness gated on that root, planning paths derived via a configurable slug that defaults to this repo’s `.engineering/artifacts/planning` convention, and clear client-side agent responsibilities documented.

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| MCP agent (client) | Create worktrees, init `.engineering`, bind sessions to validated planning paths | As an MCP agent, I want the server to accept a required worktree root and derive planning paths so that I own Git lifecycle while the server only validates and writes |
| Server operator / deployer | Fail-fast config, Docker volume layout, readiness probe | As an operator, I want the server to refuse start/ready without a worktree root so that misconfigured containers never serve traffic |
| Workflow author / maintainer | Stable planning artifact location under the monorepo convention | As a maintainer, I want planning artifacts to remain under `.engineering/artifacts/planning` by default so that existing work packages keep working |

### Secondary Stakeholders
- Cloud migration planners — Phase 1 container security and multiplicity goals
- Reviewers of PR #267 — correctness of brief-to-repo adaptation

## Context

### Integration Points
- Startup config (`src/config.ts`) — today’s required `--workspace` / `WORKFLOW_WORKSPACE` → `workspaceDir`; adapt toward brief `WORKTREE_ROOT` as the required worktree-root startup bind
- Session bootstrap (`start_session` and related tools in `src/tools/resource-tools.ts`) — planning folder hint / slug resolution under the configured root; canonical `planning_folder_path` return
- Planning store (`src/utils/session/store.ts`) — `PLANNING_RELATIVE_DIR` / `planningRoot` derivation
- HTTP readiness (`src/transports/http.ts` `/ready`) — gate on configured worktree root present/available
- New `src/worktree-validator.ts` — validate paths under the root; derive and verify planning directory
- Docker image/compose — worktree root volume (RW); no server-managed global planning volume
- Agent runbooks — create worktree, init `.engineering`, then call server tools

### Dependencies
- Dual-transport prerequisite complete
- Agent can create Git worktrees and initialise `.engineering` before expecting planning writes
- Draft PR #267 on `feat/phase-1-agent-managed-worktree`

### Constraints
- **Technical:** Server image must not require Git/SSH for worktree lifecycle; paths must stay within the configured worktree root; no `apply_workflow`-only root bind that contradicts this repo (no such tool today)
- **Timeline:** Phase 1 cloud migration update (design update 2026-07-20)
- **Resources:** Feature worktree at `target_path`; planning artifacts under this folder

## Scope

### In Scope

1. Required worktree-root startup configuration (CLI/env), aligned with brief `WORKTREE_ROOT`, mapped onto this repo’s real workspace/config surface (`workspaceDir` / `--workspace` / `WORKFLOW_WORKSPACE` adaptation — not a new invent-only API)
2. Fail-fast: server must not start, and `/ready` must not report ready, when the worktree root was not provided / is not available at startup
3. `/ready` contract = configured worktree root present (startup readiness), not an optional post-hoc mount check
4. Server-side derivation of planning path as `{worktreeRootOrWorkspace}/{PLANNING_SLUG}` (or equivalent), with validation before writes
5. Configurable planning slug (`PLANNING_SLUG` or equivalent); **default = `.engineering/artifacts/planning`** (repo truth). Deployments may override (e.g. brief’s `.engineering/planning`) via explicit config — no silent replacement of monorepo convention
6. New `src/worktree-validator.ts` (or equivalent module) for containment checks and planning-path verification
7. Session/tool surface updates so agents bind planning under the configured root via existing patterns (`start_session` / `planning_folder` / returned `planning_folder_path`) — research may refine exact parameter names; root itself remains startup-only
8. Docker/Compose: RW worktree-root volume; remove reliance on a server-managed global planning volume for the new architecture
9. Document agent responsibilities: identify repo, create worktree under root, init `.engineering`, then use server tools
10. Clear operator migration notes for required worktree-root config (hard cutover for the root — no optional dual-bind of a legacy optional root)
11. Path-traversal hardening: reject worktree/planning paths outside the configured root
12. Transition handling for legacy `PLANNING_FOLDER` naming only where it does not reintroduce an optional root (compatibility for path naming may be researched; required-root rule stays)

### Out of Scope

1. Server-side Git clone, worktree create, or SSH credential handling — agent owns Git lifecycle
2. Introducing a literal `apply_workflow` tool solely because the brief names it — adapt to real surfaces instead
3. Optional / dual-bound worktree root at startup (rejected — DP-5)
4. Changing workflow YAML definitions or unrelated MCP tool behaviour outside planning/worktree binding
5. Multi-tenant auth hardening beyond path containment (follow-up outside Phase 1)

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | Server refuses to become ready (and fails fast at startup) when worktree root is not provided | Unit/integration tests for config load + `/ready` 503 without root; manual smoke with missing env/flag |
| SC-2 | With a valid worktree root at startup, `/ready` reports ready when that root is available | HTTP `/ready` returns 200 and checks include the worktree-root signal |
| SC-3 | Planning path defaults to `{root}/.engineering/artifacts/planning` unless `PLANNING_SLUG` (or equivalent) overrides | Config/unit tests for default slug and override; path derivation matches `planningRoot` convention |
| SC-4 | Paths outside the configured worktree root are rejected by validation | Tests for traversal / escape attempts in worktree-validator |
| SC-5 | Agent can complete create-worktree → init `.engineering` → session/planning bind → artifact write without server Git | Documented agent steps exercised in local/container test plan |
| SC-6 | Operator-facing docs describe required worktree-root startup and agent responsibilities | Docs review checklist in PR; no requirement to put Git in the server image |
| SC-7 | No new `apply_workflow`-only root bind contradicts repo tools | Code review: root from startup config; session bind via existing tool family |

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](02-assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria), not here.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | What problem are we solving, and what happens if we don’t? | Server-owned planning + Git lifecycle blocks thin/secure Phase 1 containers and per-project isolation. Locked: required startup worktree root; readiness = that root; agent owns Git. |
| Problem | What triggers the need now? | Phase 1 cloud migration update brief (v3.0 agent-managed worktrees); prior DP invalidations showed brief≠repo naming/path gaps. |
| Stakeholders | Who uses this and who decides? | Primary: MCP agents, operators, maintainers. Decisions already locked for root/readiness (DP-1a/5/6); DP-2a slug default resolved in elicitation toward repo truth. |
| Context | What systems does this touch? Constraints? | `config.ts`, session store, `start_session`, `/ready`, new validator, Docker volumes, agent docs. No Git in server image. Hard cutover for required root. |
| Scope | What is in / out / deferred? | In: required root, readiness, slug default+config, validator, session bind adaptation, Docker, docs, containment. Out: server Git, inventing `apply_workflow`, optional root dual-bind. |
| Success | How will we know we’re done? | Fail-fast without root; `/ready` gated; default planning slug matches monorepo; override works; traversal rejected; agent path documented and testable. |

### Clarifications Made
- **Root vs session bind:** Worktree *root* is startup config only. Selecting/deriving a specific planning folder under that root uses this repo’s session/`planning_folder` patterns — not a brief-only `apply_workflow` root parameter.
- **DP-2a:** Default planning slug is `.engineering/artifacts/planning` (repo truth). Brief’s `.engineering/planning` is an allowed explicit override via configurable slug, not the silent default.
- **Stakeholder discussion:** Skipped (`has_stakeholder_input: false`); elicitation synthesised from source brief + locked comprehension decisions + code conventions.

### Open Questions Resolved
- **DP-2a (planning slug default):** Resolved — default `.engineering/artifacts/planning`; `PLANNING_SLUG` (or equivalent) remains configurable for intentional deployment divergence.
- **OQ #14–#15 / DP-1a / DP-5 / DP-6:** Already locked — required startup worktree root; that is the readiness check.

## Confirmation

**Confirmed by:** User (elicitation-complete → complete)
**Date:** 2026-07-20
**Notes:** Agent-led elicitation; stakeholder transcript skipped. Locked root/readiness decisions incorporated as requirements. DP-2a closed with monorepo default slug.
