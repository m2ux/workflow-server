---
id: readme
version: 3.0.0
---

# Work Package README Guide

**Purpose:** Guidelines for creating the `README.md` entry-point document for work package planning folders.

---

## Overview

The `README.md` file serves as the entry point and executive summary for a work package. Git hosting platforms render it automatically when browsing the folder, making it the natural landing page. It provides:
- Quick orientation for anyone joining the work
- High-level status and progress tracking
- Navigation to planning artifacts via hyperlinked progress items

> **Key Insight:** This document answers "What is this work package and what's its current status?" in under 2 minutes of reading.

---

## When to Create

**Always create the README artifact when:**
- Creating a new work package planning folder
- Work package has multiple tasks or activities
- Multiple people may work on or review the work

---

## Template

```markdown
# [Work Package Name] - [Month Year]

**Created:** [Date]
**Status:** [Planning/Ready/In Progress/Complete]
**Type:** [Feature/Bug-Fix/Enhancement/Refactor]

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

[2-3 sentences explaining what this work package does and why it matters]

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
| — | [Comprehension artifact](../../comprehension/{area}.md) | Persistent codebase knowledge *(optional)* | 20-45m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Jira Ticket | [PROJ-N](https://shielded.atlassian.net/browse/PROJ-N) |
| Parent Epic | [PROJ-N](https://shielded.atlassian.net/browse/PROJ-N) — [Epic title] |
| PR | [#N](https://github.com/midnightntwrk/midnight-node/pull/N) |

---

**Status:** Ready for implementation
```

---

## Section Guidelines

### Header Block

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive work package name | `Hybrid Search Implementation` |
| **Month Year** | When work package was created | `December 2024` |
| **Created** | Exact creation date | `2024-12-21` |
| **Status** | Current state | `Planning`, `Ready`, `In Progress`, `Complete` |
| **Type** | Category of work | `Feature`, `Bug-Fix`, `Enhancement`, `Refactor` |

Add a **Revised** field when the README is updated after completion (e.g., `**Revised:** 2024-12-28 (completed)`).

### Executive Summary

Write 2-3 sentences that answer:
- What does this work package deliver?
- Why does it matter?
- What's the key benefit?

**Good:**
```markdown
## 🎯 Executive Summary

Implement hybrid search combining vector similarity with BM25 keyword matching to improve search relevance. This addresses the current issue where exact term matches are missed by pure vector search, resulting in a 35% improvement in search precision on benchmark queries.
```

**Bad:**
```markdown
## 🎯 Executive Summary

This work package improves search.
```

### Progress Table

The Progress table is the primary navigation for the planning folder. Each Item entry is hyperlinked to the corresponding artifact file. Items that do not produce a standalone artifact (e.g., Implementation, Validation, PR review) are plain text.

Use status indicators consistently:

| Symbol | Meaning |
|--------|---------|
| ⬚ Pending | Not started |
| ◐ In Progress | Currently working |
| ✅ Complete | Finished |
| ❌ Blocked | Cannot proceed |
| ⊘ Cancelled | No longer needed |

The # column contains the artifact's numbered prefix, matching the producing activity (all artifacts from the same activity share the same number). Items without a standalone artifact use "—". The Description column provides a brief (3-8 word) summary of what the artifact covers. The Estimate column gives the expected agentic time for each item — adjust the template defaults to match the specific work package's complexity.

Optional activities that were skipped should be omitted from the table entirely — only list items that were or will be produced.

### Links Table

Consolidate external references (Jira ticket, parent epic, PR) into a single Links table. Artifact links belong in the Progress table, not here.

---

## Status Transitions

```
Planning → Ready → In Progress → Complete
              ↓
           Blocked → In Progress
              ↓
           Cancelled
```

Update the status field as work progresses:

| Status | When to Use |
|--------|-------------|
| **Planning** | Research and design in progress |
| **Ready** | Planning complete, ready to implement |
| **In Progress** | Implementation has started |
| **Complete** | All tasks finished, PR merged |
| **Blocked** | Cannot proceed (document reason) |
| **Cancelled** | Work package abandoned |

---

## Updating README.md

Update this document at these points:

1. **After planning complete** — Update status to Ready, fill in Progress table
2. **After each task** — Update Progress table statuses
3. **After completion** — Update status to Complete, add Revised date
4. **When blocked** — Update status, add notes

---

## Quality Checklist

- [ ] Title includes work package name and month/year
- [ ] Status field is current
- [ ] Executive summary is 2-3 sentences
- [ ] Progress table items are hyperlinked to artifacts
- [ ] Progress table has Description and Estimate columns filled in
- [ ] Links table has Jira ticket and PR references
- [ ] Artifact numbers match producing activity

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Work Packages Workflow](../../work-packages/workflow.toon)
