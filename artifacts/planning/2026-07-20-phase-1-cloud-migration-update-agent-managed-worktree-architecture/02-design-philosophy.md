# Design Philosophy

> design-philosophy · Phase 1 Cloud Migration Update — Agent-Managed Worktree Architecture · issue skipped · 2026-07-20

## Problem Statement

Phase 1 containerisation still assumes the workflow server owns a global planning folder (`PLANNING_FOLDER`) and would take on Git worktree and project lifecycle work. That couples the server to credentials, Git tooling, and a shared planning volume, blocking a thin, stateless container and preventing per-project artifact isolation. Without reassigning worktree ownership to the agent and deriving planning paths from `worktreeRoot`, cloud migration cannot meet its security and multiplicity goals.

### System Context

The workflow server (TypeScript/Node MCP) loads config from `src/config.ts`, registers tools (including workflow application) in `src/tools.ts`, and exposes HTTP readiness via `src/transports/http.ts`. Planning artifacts today are rooted at a server-configured planning folder. The update introduces `src/worktree-validator.ts`, adds `WORKTREE_ROOT` / `PLANNING_SLUG`, accepts agent-provided `worktreeRoot`, and changes Docker volume layout so the agent creates worktrees under a shared root while the server only validates paths and writes artifacts.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High — blocks correct Phase 1 container security and isolation model |
| Scope | Server config, tool API (`apply_workflow`), HTTP `/ready`, Docker image/compose, agent integration docs |
| Business Impact | Continuing with server-managed planning keeps Git/credentials in the image, shared planning across projects, and an incorrect operational contract for cloud agents |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** Nothing is currently failing in production — this is a proactive architectural reassignment of worktree lifecycle from server to agent. Complexity is complex: it spans config schema, tool contract, path-validation security, HTTP readiness, container volumes, and agent responsibility documentation, with trade-offs around backward compatibility (`PLANNING_FOLDER` fallback) and path-traversal hardening. The v3.0 design update decides the direction, but elicitation, research, and comprehension are still needed before planning.

## Workflow Path Decision

**Selected Path:** Full workflow (elicitation + research)

**Activities Included:**
- [x] Requirements Elicitation
- [x] Research
- [ ] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Confirmed via checkpoint `classification-and-path-confirmed` → `full-workflow`. Multi-surface API and security changes need crisp requirements (agent contract, validation errors, deprecation behaviour) and research of existing patterns in this repo and related Phase 1 plans before task breakdown. Codebase comprehension remains mandatory before planning.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Phase 1 window; design update dated 2026-07-20 |
| Technical | Server must not require Git/SSH in the image; `worktreeRoot` must stay within `WORKTREE_ROOT`; planning path derived as `{worktreeRoot}/{PLANNING_SLUG}` |
| Dependencies | Dual-transport work (prerequisite) complete; agent must create worktree and init `.engineering` before `apply_workflow` |
| Resources | Edits in feature worktree on `feat/phase-1-agent-managed-worktree`; draft PR #267 |

## Success Criteria

Success criteria: [requirements](requirements-elicitation.md#success-criteria) once elicited.

## Notes

Source brief: `/home/mike1/Incoming/phase1_update_agent_worktrees.md`. Reference plans cited there include `phase1_cloud_migration_plan_v3.md` and `simplified_architecture_worktree_root.md`.
