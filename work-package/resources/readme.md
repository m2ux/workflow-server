---
name: readme
description: Guidelines for creating the README.md entry-point document for work package planning folders.
metadata:
  version: 3.1.0
  order: 1
  legacy_id: 1
---

# Work Package README Guide

The `README.md` is the entry point for a work package planning folder (git hosting renders it when browsing). It is an **index** — a hub of links answering "what is this work package and what's its current status?" in under 2 minutes. It never restates what a linked artifact records (single-source-and-link).

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
| 08 | [Close-out (COMPLETE.md)](complete-wp.md) | Deliverables, deferred items, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Jira Ticket | [PROJ-N](https://{jira_host}/browse/PROJ-N) |
| Parent Epic | [PROJ-N](https://{jira_host}/browse/PROJ-N) — [Epic title] |
| PR | [#N](https://{repo_host}/{org}/{repo}/pull/N) |
```

## Rules

### Header line

- One blockquote line: type · creation date · status (lean-header). Status values: `Planning`, `Ready`, `In Progress`, `Complete`.
- Status appears **once**, in this line (state-once-per-artifact) — no footer status section, no closing narrative paragraph. Deferred items and outcomes live in COMPLETE.md; link it from Progress, don't copy (single-source-and-link).
- When the README is updated after completion, append `· Revised YYYY-MM-DD`.

### Executive Summary

2-3 sentences answering: what does this deliver, why does it matter, what's the key benefit. Include the concrete problem and measurable impact where known — not a one-line restatement of the title.

### Problem Overview / Solution Overview

Plain-language sections for non-technical stakeholders, each exactly two paragraphs; the placeholder is replaced when the producing step executes.

- **Problem Overview** — `present-problem-overview` step (`start-work-package`): what the system currently does and why it's problematic, then the consequences.
- **Solution Overview** — `present-solution-overview` step (`plan-prepare`): what the fix does and how it works at a high level. Links the work package plan for the task breakdown rather than re-listing the problem items.

### Progress Table

The primary navigation for the planning folder.

- Each Item is hyperlinked to its artifact file; items with no standalone artifact (Implementation, Validation, PR review) are plain text with "—" in the # column.
- The # column is the artifact's numbered prefix, matching the producing activity (artifacts from the same activity share the number).
- Description: 3-8 word summary. Estimate: expected agentic time — adjust template defaults to the work package's complexity.
- Omit skipped optional activities entirely — list only items that were or will be produced.
- Status vocabulary: `⬚ Pending`, `◐ In Progress`, `✅ Complete`, `❌ Blocked`, `⊘ Cancelled`.

### Links Table

External references only (Jira ticket, parent epic, PR). Artifact links belong in the Progress table.
