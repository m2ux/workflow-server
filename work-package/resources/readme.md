---
name: readme
description: Guidelines for creating the README.md entry-point document for work package planning folders.
metadata:
  version: 3.3.0
  order: 1
  legacy_id: 1
---

# Work Package README Guide

The `README.md` is the entry point for a work package planning folder (git hosting renders it when browsing). It follows the canonical [Planning Folder README Guide](../../meta/resources/planning-readme.md); this resource supplies the concrete work-package seed template and the work-package-specific specifics below.

## Template

```markdown
# [Work Package Name] - [Month Year]

> [Feature/Bug-Fix/Enhancement/Refactor] · Created [YYYY-MM-DD] · **Status:** [Planning/Ready/In Progress/Complete]

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

[2-3 sentences explaining what this work package does and why it matters]

## Problem Overview

*Populated during start-work-package activity.*

## Solution Overview

*Populated during plan-prepare activity.*

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
| 08 | [Close-out (COMPLETE.md)](complete-wp.md) | Deliverables, known limitations, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Jira Ticket | [PROJ-N](https://{jira_host}/browse/PROJ-N) |
| Parent Epic | [PROJ-N](https://{jira_host}/browse/PROJ-N) — [Epic title] |
| PR | [#N](https://{repo_host}/{org}/{repo}/pull/N) |
```

## Rules

The shared header-line, Executive Summary, Problem/Solution Overview, Progress-table, Links-table, and layout-discipline rules (status stated once, no footer, no `---`, single-source-and-link) are defined in the canonical [Planning Folder README Guide](../../meta/resources/planning-readme.md). Work-package specifics:

- **Classifier** — the work-package type: `Feature`, `Bug-Fix`, `Enhancement`, `Refactor`. Status values: `Planning`, `Ready`, `In Progress`, `Complete`.
- **Problem Overview** — written by the `present-problem-overview` step (`start-work-package` activity).
- **Solution Overview** — written by the `present-solution-overview` step (`plan-prepare` activity); links the work package plan rather than re-listing the problem items.
- **Outcomes and deferred items** live in [COMPLETE.md](complete-wp.md) and the [deferred-items register](deferred-items.md); link them from Progress, don't copy.
- **Links table** — Jira ticket, parent epic, PR.
