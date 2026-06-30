# Review-Mode Hardening: Config-Change & Interaction Defects - June 2026

**Created:** 2026-06-30  
**Status:** In Progress — Design Philosophy complete; entering Codebase Comprehension  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Harden the `work-package` workflow's review-mode path so it catches a class of defect that slipped through a real review: a one-line config change that is locally correct but globally harmful (unbounded orphan-storage growth on every routine governance close). Implements five augmentations — ingest-and-rebut existing PR feedback, a config-change blast-radius check, a lifecycle/conservation ledger in the structural pass, impact-based severity axes, and a reported-failure triage plus multi-instance coverage gate.

---

## Problem Overview

When the workflow reviews someone else's pull request, it reads the proposed change in isolation and judges whether the new lines of code are correct. In a recent real review this was not enough. A single-line configuration change was correct on its own, but it quietly changed how unrelated, untouched parts of the system behaved — causing the system to accumulate permanent leftover records every time a routine action ran. The review rated the change as safe to merge, even though another automated reviewer had already flagged the exact problem on the same pull request nineteen days earlier. The warning was simply never read, the side-effect had no place in the severity scale used to rate findings, and the part of the code that actually failed in the field had never been tested.

This work package closes that gap by teaching the review process five new habits: read and respond to every comment already on the pull request before forming a verdict; when a configuration or type setting changes, trace its effect through all the code that depends on it — not just the changed lines; prove that anything created always has a matching cleanup on every path, not only the one in the diff; recognise that code can be technically correct yet still harmful (for example, by causing unbounded growth) and rate it accordingly; and treat reported runtime errors and untested code variants as findings that must be explained, not quietly downgraded. The result is a review process that judges the whole system a change touches, rather than only the change itself.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 05 | `Work package plan` | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](test-plan.md) | E2E walk / lint / smoke coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Technique + activity definition changes | 1-4h | ⬚ Pending |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | `Code review` | Automated definition-quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](test-suite-review.md) | Harness coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | `Comprehension artifact` | Persistent codebase knowledge | 20-45m | ⬚ Pending |
| — | Validation | Walk + lint + smoke verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | `Completion summary` | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#145](https://github.com/m2ux/workflow-server/issues/145) |
| PR | _pending_ |

---

**Status:** In Progress
