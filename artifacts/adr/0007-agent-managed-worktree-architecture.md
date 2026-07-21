# ADR-0007: Agent-Managed Worktree Architecture

**Status:** Proposed
**Date:** 2026-07-21
**Issue:** skipped
**PR:** [#267](https://github.com/m2ux/workflow-server/pull/267)

---

## Context

### Technical Forces

Phase 1 containerisation needs a thin workflow-server image that does not own Git credentials, worktree lifecycle, or a shared global planning volume. Planning artifacts must resolve under a required worktree/workspace root so each project isolates its `.engineering` tree. The repository already binds a required `workspaceDir` at startup (`--workspace` / `WORKFLOW_WORKSPACE`) and derives planning under `.engineering/artifacts/planning`; the cloud brief names `WORKTREE_ROOT`, `PLANNING_SLUG`, and an `apply_workflow` + per-call `worktreeRoot` surface that does not match this repo's tools.

### Business Forces

Cloud migration multiplicity and security goals fail if the server keeps Git tooling in-image or writes all planning to one shared volume. Operators need fail-fast startup and `/ready` gated on a configured root; agents need a clear lifecycle: create worktree, init `.engineering`, then bind sessions.

### Operational Forces

Path containment must reject traversal and sibling-prefix escapes. Default planning slug must remain the monorepo convention; deployments may override via explicit config. Hard cutover for the required root — no optional dual-bind.

## Decision Drivers

1. **Thin container** — Server validates and writes; agent owns Git worktree create/init.
2. **Minimal blast radius** — Prefer adapting existing `workspaceDir` / `planningRoot` over CRITICAL signature churn.
3. **Repo truth over brief literalism** — Map brief names onto real tools; do not invent `apply_workflow`.
4. **Containment** — All write paths stay inside the configured root.
5. **Operator clarity** — Required root at startup; `/ready` reflects that bind.

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **A. Env alias + inject slug without changing `planningRoot` signature** (selected) | Minimal blast radius; meets SC-1–SC-7; reuses fail-fast/`/ready` | Brief names stay aliases, not renames |
| B. Rename `workspaceDir` → `worktreeRoot` across API | Matches brief literally | Wide rename churn; breaks tests/docs/scripts |
| C. Per-call `worktreeRoot` on tools / invent `apply_workflow` | Matches brief §3.2 | Contradicts locked startup-only root; CRITICAL fan-out |
| D. Change `planningRoot` to take slug param everywhere | Explicit config plumbing | Signature churn on CRITICAL symbol (15 processes) |
| E. Optional dual-bind of legacy root | Softer migration | Rejected — hard cutover required for Phase 1 security model |

**Rejected:** B (rename churn); C (wrong tool surface / fan-out); D (`planningRoot` CRITICAL); E (optional root dual-bind).

## Decision

Adopt **agent-managed worktrees under a required startup worktree root**:

- Keep `ServerConfig.workspaceDir` as the Phase 1 worktree/workspace root. Accept `WORKTREE_ROOT` as an env alias into the same resolver (CLI `--workspace` > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT`).
- Make the planning relative segment configurable via `PLANNING_SLUG` (default `.engineering/artifacts/planning`) by injecting the relative dir at server create — **without** changing `planningRoot(workspaceDir)`'s call-site signature.
- Add `src/worktree-validator.ts` for **path containment only** (resolve, sep-aware prefix, realpath escape rejection) — not Git lifecycle.
- Gate `/ready` on configured root presence; document agent lifecycle and Docker RW worktree-root bind.
- Do **not** invent `apply_workflow` or per-call root binding.

## Consequences

**Positive:**
- Thin server image without Git/SSH for worktree lifecycle
- Per-project planning isolation under agent-created worktrees
- Contained blast radius on CRITICAL `planningRoot` callers
- Clear operator/agent contract documented in SETUP and MCP examples

**Negative:**
- Brief naming remains aliased rather than a full API rename
- Agents must create worktrees and init `.engineering` before expecting planning writes
- Hard cutover requires operator migration notes

**Neutral:**
- `WORKFLOW_WORKSPACE` and `WORKTREE_ROOT` both resolve to the same required field
- Cloud layouts that want `.engineering/planning` use explicit `PLANNING_SLUG` override

## Related Decisions

- [ADR-0003: Server-Managed Session State](0003-server-managed-session-state.md) — planning folder layout under workspace; server owns sealed session state.

## Confirmation

Validate via PR #267 success criteria: fail-fast without root (SC-1); `/ready` gated (SC-2); default slug + override (SC-3); containment tests (SC-4); documented agent path (SC-5/SC-6); no invented `apply_workflow` root bind (SC-7).

## Compliance

Code review and tests cover config precedence, validator escapes, and `/ready` checks. Docs (SETUP, MCP examples) describe agent lifecycle; no parallel agent-managed-worktrees runbook outside SETUP.

## References

- Planning: `.engineering/artifacts/planning/2026-07-20-phase-1-cloud-migration-update-agent-managed-worktree-architecture/`
- PR: https://github.com/m2ux/workflow-server/pull/267
