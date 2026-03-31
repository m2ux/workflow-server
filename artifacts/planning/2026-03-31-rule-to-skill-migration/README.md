# Rule-to-Skill Migration - March 2026

**Created:** 2026-03-31  
**Status:** Planning  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Extract duplicated behavioral rule groups from workflow TOON files into formal, reusable skill+resource sets. This eliminates ~140 duplicated rules across 10+ workflows by leveraging the new workflow-level skills capability (#86), replacing prose rule text with canonical skill definitions that provide structured protocols, inputs, outputs, and resources.

---

## Problem Overview

The workflow system currently embeds behavioral rules as prose text directly inside TOON configuration files. When multiple workflows need the same rules — such as orchestrator discipline or worker execution protocols — each workflow restates them independently, often with slightly different phrasing. This means a single conceptual rule can appear in as many as five different workflows, each maintaining its own copy with no formal link between them.

This duplication creates real maintenance problems. When a rule needs updating, every copy must be found and changed separately, and inconsistencies inevitably creep in over time. Agents consuming these workflows cannot programmatically discover or reference the protocols because they are buried in unstructured prose rather than being defined as formal, reusable components with clear inputs, outputs, and phases.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
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
| GitHub Issue | [#88](https://github.com/m2ux/workflow-server/issues/88) |
| PR | [#89](https://github.com/m2ux/workflow-server/pull/89) |
| Branch | `enhancement/88-rule-to-skill-migration` |
| Depends On | [#86](https://github.com/m2ux/workflow-server/issues/86) — Workflow-level skills |

---

**Status:** Design philosophy complete — ready for research
