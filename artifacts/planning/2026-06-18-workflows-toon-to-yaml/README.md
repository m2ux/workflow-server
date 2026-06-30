# Workflow Definitions: TOON to YAML Conversion - June 2026

**Created:** 2026-06-18  
**Status:** In Progress  
**Type:** Refactor

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Convert the workflow and activity definition files in the `workflows` branch from TOON format into YAML. The conversion preserves the existing Goal → Activity → Skill → Tools model and all workflow semantics while moving the definitions onto a more widely supported, tooling-friendly serialization format. Exact file scope (e.g. whether technique `.toon` files are in scope alongside the 105 workflow/activity `.toon` files) is resolved during the planning activity.

---

## Problem Overview

The workflow orchestration server reads its workflow and activity definitions from files written in TOON, a compact serialization format. There are 105 of these `.toon` files spread across 11 workflow folders in the `workflows` branch, with supporting `resources/*.md` files in Markdown. While TOON is concise, it is an uncommon format with limited editor support, validation tooling, and familiarity among contributors, which makes the definitions harder to author, review, and maintain.

This work package converts those definitions to YAML, a format that is far more widely understood and supported by standard tooling. The intended outcome is that the same workflows behave identically while becoming easier for people to read, edit, and validate. The conversion is a representation change only: it does not alter what any workflow does, only the file format the server loads them from.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | `Design philosophy` | Problem classification, design rationale, workflow path | 15-30m | ⬚ Pending |
| 01 | `Assumptions log` | Tracked assumptions across all activities | 10-15m | ⬚ Pending |
| 05 | `Work package plan` | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | `Code review` | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | `Comprehension artifact` | Persistent codebase knowledge | 20-45m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | `Completion summary` | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | _Skipped — proceeding without a tracked issue_ |
| PR | _Not yet created_ |

---

**Status:** In Progress — worktree and feature branch created; paused at PR-creation boundary pending user decision
