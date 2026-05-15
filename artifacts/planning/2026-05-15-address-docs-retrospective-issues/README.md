# Address Docs-Refresh Retrospective Issues - May 2026

**Created:** 2026-05-15
**Status:** Planning
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Act on the prioritized recommendations from the `2026-05-14-refresh-workflow-server-docs` retrospective. The retrospective identified a single root cause behind every review-feedback item on that run — the canonical PR-description template is enforced as prose rather than as gate-shaped rules — and a small cluster of lower-priority workflow gaps. This work package lands the highest-leverage fix and (subject to scope review at `plan-prepare`) the supporting medium- and low-priority changes.

---

## Problem Overview

The previous work package — refreshing the workflow-server documentation — reached PR review with three deviations standing in the pull-request body: the issue link was missing entirely, the summary was longer than the template prescribes, and the changes were grouped by commit message rather than by component. Every one of the human reviewer's feedback items on that run pointed at one of those three deviations. None of the workflow's automated gates caught any of them, even though the canonical PR-description template explicitly forbids each pattern. The reason is structural: the constraints live as prose inside a markdown "What NOT to Include" table in the template resource, so the gates that run against the rendered PR body see them only as advisory text.

The consequence is that the strategic-review activity rated the work `acceptable` while the deviations stood, and the user had to catch them manually at `review-received`. That is exactly the failure mode the strategic-review gate is meant to prevent — visible-to-the-reviewer deviations from a canonical template should be caught by the workflow before a human sees the PR, not by the human at the very last gate. Three secondary process gaps were also recorded — unsigned commits surfacing only at strategic-review, a workflows-worktree environment prerequisite surfacing mid-implementation, and a meta-activity prescribing a tool the worker is not allowed to call — each of which costs a small amount of friction per work package but is straightforward to close.

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
| — | Implementation | Code changes per plan | 1-3h | ⬚ Pending |
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
| Issue | _None — derived from prior work-package retrospective (no associated GitHub/Jira issue)_ |
| Driving Input | [2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md](../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md) |
| Parent Branch | `feat/115-server-managed-session-state` |
| Target Branch | `chore/docs-retrospective-followups` |
| Worktree | `~/projects/work/workflow-server/2026-05-15-address-docs-retrospective-issues/` |
| PR | [#120](https://github.com/m2ux/workflow-server/pull/120) (draft) |

---

**Status:** Ready for implementation planning. Worktree materialized at `~/projects/work/workflow-server/2026-05-15-address-docs-retrospective-issues/` on branch `chore/docs-retrospective-followups`, branched off `feat/115-server-managed-session-state`. Draft PR [#120](https://github.com/m2ux/workflow-server/pull/120) opened against the parent branch. Driving input is the retrospective from the preceding docs-refresh work package.
