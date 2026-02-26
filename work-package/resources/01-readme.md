---
id: readme
version: 2.0.0
---

# Work Package README Guide

**Purpose:** Guidelines for creating the `README.md` entry-point document for work package planning folders.

---

## Overview

The `README.md` file serves as the entry point and executive summary for a work package. Git hosting platforms render it automatically when browsing the folder, making it the natural landing page. It provides:
- Quick orientation for anyone joining the work
- High-level status and progress tracking
- Navigation to detailed planning documents

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

| Item | Status | Notes |
|------|--------|-------|
| Task 1 | ⬚ Pending | Description |
| Task 2 | ⬚ Pending | Description |
| Task 3 | ⬚ Pending | Description |

---

## 🎯 This Work Package

**Feature to implement:**

1. **[Feature Name]**
   - Priority: HIGH/MEDIUM/LOW
   - Effort: X-Yh agentic + Zh review

---

## 📅 Timeline

| Activity | Tasks | Time Estimate |
|-------|-------|---------------|
| Planning | Requirements, research, analysis | X-Yh agentic + Zh review |
| Implementation | Tasks 1-N | X-Yh agentic + Zh review |
| Validation | Testing, documentation | X-Yh agentic + Zh review |

**Total:** X-Y hours agentic + Z hours review

---

## 🎯 Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] All tests passing
- [ ] ADR written (if significant decision)

---

## 📚 Artifact Index

This section is the primary navigation for the planning folder. It lists every artifact the work-package workflow may produce, grouped by phase. Link each artifact as it is created; mark unproduced artifacts with "—" in the Status column.

### Planning Phase

| # | Artifact | Filename | Activity | Status |
|---|----------|----------|----------|--------|
| — | **README** | [README.md](README.md) | start-work-package | 👈 You are here |
| 01 | Design Philosophy | [design-philosophy.md](01-design-philosophy.md) | design-philosophy | ⬚ Pending |
| 01 | Assumptions Log | [assumptions-log.md](01-assumptions-log.md) | design-philosophy (created), updated throughout | ⬚ Pending |
| 02 | Requirements Elicitation | [requirements-elicitation.md](02-requirements-elicitation.md) | requirements-elicitation | ⬚ Pending *(optional)* |
| 02 | Research | [kb-research.md](02-research.md) | research | ⬚ Pending |
| 03 | Implementation Analysis | [implementation-analysis.md](03-implementation-analysis.md) | implementation-analysis | ⬚ Pending |
| 04 | Work Package Plan | [work-package-plan.md](04-work-package-plan.md) | plan-prepare | ⬚ Pending |
| 05 | Test Plan | [test-plan.md](05-test-plan.md) | plan-prepare | ⬚ Pending |

### Review Phase

| # | Artifact | Filename | Activity | Status |
|---|----------|----------|----------|--------|
| 06 | Change Block Index | [change-block-index.md](06-change-block-index.md) | post-impl-review | ⬚ Pending |
| 07 | Manual Diff Review | [manual-diff-review.md](07-manual-diff-review.md) | post-impl-review | ⬚ Pending |
| 08 | Code Review | [code-review.md](08-code-review.md) | post-impl-review | ⬚ Pending |
| 09 | Test Suite Review | [test-suite-review.md](09-test-suite-review.md) | post-impl-review | ⬚ Pending |
| 10 | Architecture Summary | [architecture-summary.md](10-architecture-summary.md) | post-impl-review / strategic-review | ⬚ Pending |
| 11 | Strategic Review | [strategic-review.md](11-strategic-review.md) | strategic-review | ⬚ Pending |

### Completion Phase

| # | Artifact | Filename | Activity | Status |
|---|----------|----------|----------|--------|
| 12 | Completion Summary | [COMPLETE.md](12-COMPLETE.md) | complete | ⬚ Pending |
| 13 | Workflow Retrospective | [workflow-retrospective.md](13-workflow-retrospective.md) | complete | ⬚ Pending |

### External Artifacts (outside planning folder)

| Artifact | Location | Activity | Status |
|----------|----------|----------|--------|
| Comprehension Artifact | `.engineering/artifacts/comprehension/{area}.md` | codebase-comprehension *(optional)* | ⬚ Pending |
| ADR | `.engineering/artifacts/adr/NNNN-{title}.md` | complete *(conditional on complexity)* | ⬚ Pending |
| PR Review Analysis | `.engineering/artifacts/reviews/{date}-pr{n}-review-analysis.md` | complete *(review mode)* | ⬚ Pending |

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

Use status indicators consistently:

| Symbol | Meaning |
|--------|---------|
| ⬚ Pending | Not started |
| ◐ In Progress | Currently working |
| ✅ Complete | Finished |
| ❌ Blocked | Cannot proceed |
| ⊘ Cancelled | No longer needed |

### Success Criteria

List measurable, verifiable criteria:

**Good:**
```markdown
- [ ] Search P95 latency < 200ms (baseline: 487ms)
- [ ] Non-zero result rate > 90% (baseline: 64%)
- [ ] All 25 unit tests passing
- [ ] ADR-0015 approved
```

**Bad:**
```markdown
- [ ] Search is faster
- [ ] Tests work
```

### Artifact Index

The Artifact Index replaces a simple document navigation table. It lists every artifact the workflow may produce, grouped by phase (Planning, Review, Completion, External). Each entry has a numbered prefix, the canonical filename from the workflow definition, the activity that produces it, and a status indicator. Update the status column as artifacts are created. Mark optional or conditional artifacts accordingly. Always link to the actual file using relative paths.

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

1. **After planning complete** - Update status to Ready
2. **After each task** - Update Progress table
3. **After implementation** - Update status to Complete, verify success criteria
4. **When blocked** - Update status, add notes

---

## Quality Checklist

- [ ] Title includes work package name and month/year
- [ ] Status field is current
- [ ] Executive summary is 2-3 sentences
- [ ] Progress table reflects current state
- [ ] Timeline has realistic estimates
- [ ] Success criteria are measurable
- [ ] Artifact index lists all produced artifacts with working links

---

## Integration with Workflow

This guide supports work package planning:

1. **Create planning folder** → Create README.md first
2. **Complete planning** → Update status to Ready
3. **During implementation** → Update progress after each task
4. **After completion** → Update status to Complete

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Work Packages Workflow](../../work-packages/workflow.toon)
