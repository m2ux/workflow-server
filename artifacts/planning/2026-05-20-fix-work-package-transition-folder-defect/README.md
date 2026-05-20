# Fix Work Package Transition Folder Defect - May 2026

**Created:** 2026-05-20
**Status:** Planning
**Type:** Bug-Fix

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

When `start_session({ workflow_id: "meta" })` mints a transient `transition-<uuid>` planning slug and a subsequent `dispatch_child({ workflow_id: "<client>" })` is called, the server (a) does not promote the folder from the transient slug to a dated planning slug derived from the client work-package, and (b) writes the child session at the top level of `session.json` with the meta parent demoted into `parentSession`. This is the inverse of the documented `workflow-engine::handle-sub-workflow` contract, which requires the child to be embedded under `parent.triggeredWorkflows[N].state`. The fix restores the documented invariant and corrects the folder naming.

---

## Problem Overview

When a user starts a new piece of work, the workflow server first opens a temporary "scratchpad" folder while the system decides which workflow actually applies. Once the system knows what kind of work this is — for example, a work package against the workflow-server itself — it is supposed to rename that scratchpad folder to a dated, descriptive name and slot the new work into the existing record of what the system is doing, keeping the original record at the top of the file. Today the server does neither of these things: the folder keeps its temporary name forever, and the new work is written as if it were the only thing happening, with the prior record demoted into a nested field underneath it.

The consequence is that the on-disk planning trail no longer matches what the documented contract says it should look like, which makes it harder for anyone — human or agent — to find an in-flight work package by reading the planning directory, and harder for follow-up tooling to find the parent meta-session as the authoritative head record. Over many sessions this also leaves the planning directory cluttered with `transition-<uuid>` folders that carry no human-readable hint of what they were for, slowing down debugging and audit reviews of past work.

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
| Issue | _Skipped at user request (issue-verification checkpoint)_ |
| PR | [#121](https://github.com/m2ux/workflow-server/pull/121) |

---

**Status:** Design philosophy complete — proceeding to codebase comprehension
