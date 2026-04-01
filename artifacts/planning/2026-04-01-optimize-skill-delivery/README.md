# Optimize Skill Delivery - April 2026

**Created:** 2026-04-01  
**Status:** Planning  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Restructure the workflow server's skill delivery mechanism to provide just-in-time, step-scoped skill content instead of bulk activity-level loading. This reduces agent context overhead, improves protocol adherence, and establishes a 1-skill-per-step invariant that makes skill delivery predictable and focused.

---

## Problem Overview

The workflow server currently delivers all skill content for an activity in a single bulk load when an agent begins executing. This means the agent receives every skill protocol, rule set, and resource document associated with the activity at once, regardless of which specific step it is working on. The result is a large volume of content that the agent must hold in context and selectively parse, even though only a small portion is relevant to the immediate task at hand.

This approach creates measurable overhead. Agents spend processing effort filtering through unrelated protocols to find the guidance relevant to their current step. Context windows fill with content that will not be needed until much later — or at all, if certain steps are conditionally skipped. For complex activities with many skills and resources, this front-loading can degrade the agent's ability to focus on the step at hand, increase the likelihood of following incorrect protocols, and slow down overall workflow execution.

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
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | [Comprehension artifact](../../comprehension/{area}.md) | Persistent codebase knowledge | 20-45m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#96](https://github.com/m2ux/workflow-server/issues/96) |
| PR | [#97](https://github.com/m2ux/workflow-server/pull/97) |

---

**Status:** Ready for design philosophy
