# Phase 1 Cloud Migration Update — Agent-Managed Worktree Architecture - July 2026

> Enhancement · Created 2026-07-20 · **Status:** Research complete — next: plan & prepare

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Work package started for the Phase 1 agent-managed worktree architecture update: feature branch and draft PR are ready, requirements are locked, and research has mapped implementation onto existing `workspaceDir` / planning-store / `/ready` / `start_session` patterns (no invent-only `apply_workflow` root bind).

## Problem Overview

Today the workflow server assumes it owns a global planning folder and, in the Phase 1 container plan, would also take on Git worktree and project lifecycle work. That couples the server to credentials, Git tooling, and a shared planning volume, which fights a simple, stateless container and makes it hard to isolate one project’s artifacts from another.

This work package updates Phase 1 so the agent (MCP client) creates and owns the Git worktree and initialises `.engineering`, while the server only accepts a `worktreeRoot`, derives the planning path, validates it, and writes artifacts there. The result is a thinner server image, clearer security boundaries, and per-project isolation without the server managing Git.

## Solution Overview

*[Brief solution statement — filled when the plan is prepared; link the work package plan for the task breakdown.]*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 03 | [Requirements elicitation](03-requirements-elicitation.md) | Scope, success criteria, agent/operator contract | 20-40m | ✅ Complete |
| 04 | [Knowledge-base research](04-kb-research.md) | Patterns for validator, config bind, readiness, Docker, agent contract | 20-40m | ✅ Complete |
| 05 | `Work package plan` | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | `Code review` | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | [Comprehension artifact](../../comprehension/workflow-server.md) | Persistent codebase knowledge (workspace binding deep-dive) | 20-45m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Close-out (COMPLETE.md)](complete-wp.md) | Deliverables, known limitations, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Source document | [`phase1_update_agent_worktrees.md`](/home/mike1/Incoming/phase1_update_agent_worktrees.md) |
| Issue | — (skipped) |
| PR | [#267](https://github.com/m2ux/workflow-server/pull/267) |
