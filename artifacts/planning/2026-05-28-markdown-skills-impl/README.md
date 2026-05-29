# Markdown Skills Migration Implementation - May 2026

**Created:** 2026-05-28  
**Status:** Planning  
**Type:** Refactor

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Implement the markdown-skills migration designed in the 2026-05-22 planning artifact. Replace TOON-based per-workflow skills with markdown techniques and resources stored under each workflow folder, served by the workflow-server with workflow-local to `meta` precedence resolution and a TOON-projection delivery pass for techniques. This unifies the on-disk content shape and removes the duplicate skill source.

---

## Problem Overview

The workflow-server currently delivers per-workflow knowledge through a TOON-encoded skill format that lives alongside the workflow definitions. Authoring these files requires understanding the TOON projection rules in addition to the underlying intent, and the format is harder for humans to read and edit than plain markdown. The migration plan committed on 2026-05-22 documented the target shape — per-workflow `techniques/` and `resources/` folders containing markdown files, with `workflows/meta/` doubling as the cross-workflow shared layer — but the implementation was deferred.

Until the markdown layout is live, contributors cannot iterate on workflow knowledge in the same medium they iterate on every other artifact. The TOON skill source also remains duplicated against the planning-folder markdown that the design produced, so any drift between the two has to be reconciled by hand. Shipping this migration removes both frictions and makes the workflow-server's skill-resolution code easier to evolve.

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
| — | Implementation | Code changes per plan | 2-4h | ⬚ Pending |
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
| GitHub Issue | [#125](https://github.com/m2ux/workflow-server/issues/125) |
| Original Plan | [2026-05-22-claude-skills-migration](../2026-05-22-claude-skills-migration/) |
| PR | _Pending_ |

---

**Status:** Planning folder initialized
