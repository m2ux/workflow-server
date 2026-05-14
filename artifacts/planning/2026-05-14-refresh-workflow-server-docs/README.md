# Refresh Workflow-Server Docs - May 2026

**Created:** 2026-05-14
**Status:** Planning
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Refresh and update the workflow-server repository documentation (README, SETUP, AGENTS/CLAUDE guidance, `docs/`, schema docs, IDE setup) to reflect the current state of the project after recent feature work (hierarchical dispatch, server-managed session state, operation-focused skills). The goal is to bring user-facing and contributor-facing documentation back in sync with the implementation, schemas, and tools, so newcomers and AI agents land on accurate guidance.

---

## Problem Overview

The workflow-server has evolved through several substantial feature additions — hierarchical dispatch, server-managed session state, operation-focused skills, expanded MCP tooling — but the project's documentation has not kept pace. Top-level files (README, SETUP, AGENTS, CLAUDE), the `docs/` reference set, and the schema documentation each predate one or more of these changes, and parts of them now describe behavior, tools, or schemas that have moved, been renamed, or no longer exist.

The practical consequence is that anyone reading the docs — a new contributor, an AI agent invoking MCP tools, or an integrator setting up the server — receives a partially incorrect mental model. They may call deprecated tools, follow setup steps that no longer apply, or trust schema descriptions that no longer match the wire format. That friction shows up as wasted time, support questions, and quiet behavioral drift between what the docs say and what the server does.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ⬚ Pending |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ⬚ Pending |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| — | Implementation | Documentation updates per plan | 1-3h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated doc quality review | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, typecheck, link verification | 10-20m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | _None — direct user request (no associated GitHub/Jira issue)_ |
| PR | [#118](https://github.com/m2ux/workflow-server/pull/118) |
| Target Branch | `chore/refresh-workflow-server-docs` |
| Worktree | `~/projects/work/workflow-server/2026-05-14-refresh-workflow-server-docs/` |

---

**Status:** Ready for design-philosophy activity
