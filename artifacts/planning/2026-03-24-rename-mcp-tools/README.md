# Rename MCP Tools - March 2026

**Created:** 2026-03-24  
**Status:** Planning  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Rename the workflow-server's two entry-point MCP tools to eliminate naming ambiguity and enable session-aware interactions. `get_activities` becomes `match_goal` to avoid overloading the workflow "activity" concept, and `get_rules` becomes `start_session` to return both agent guidelines and a session token for correlated subsequent calls.

---

## Problem Overview

The workflow server provides tools that AI agents call to discover and execute structured workflows. Two of these tools have names that cause confusion. The first, `get_activities`, is meant to help agents find the right workflow for a given task, but it uses the word "activities" — the same term used for phases within a workflow. This double meaning forces agents to guess which sense of "activity" applies in any given context, leading to errors during workflow discovery.

The second tool, `get_rules`, gives agents their behavioral guidelines but offers no way to establish an ongoing session. Without a session identifier, the server treats every call as independent and cannot track the sequence of actions an agent takes during a single working session. This limits the server's ability to provide context-aware responses and makes it harder to correlate related operations for debugging or auditing.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#59](https://github.com/m2ux/workflow-server/issues/59) |
| PR | [#60](https://github.com/m2ux/workflow-server/pull/60) |
| Engineering | [Planning folder](https://github.com/m2ux/workflow-server/blob/main/.engineering/artifacts/planning/2026-03-24-rename-mcp-tools/README.md) |

---

**Status:** Planning
