---
id: start-here
version: 1.0.0
---

# Work Package START-HERE Guide

**Purpose:** Guidelines for creating the `START-HERE.md` executive summary document for work package planning folders.

---

## Overview

The `START-HERE.md` file serves as the entry point and executive summary for a work package. It provides:
- Quick orientation for anyone joining the work
- High-level status and progress tracking
- Navigation to detailed planning documents

> **Key Insight:** This document answers "What is this work package and what's its current status?" in under 2 minutes of reading.

---

## When to Create

**Always create `START-HERE.md` when:**
- Creating a new work package planning folder
- Work package has multiple tasks or phases
- Multiple people may work on or review the work

**Location:** `.engineering/artifacts/planning/YYYY-MM-DD-work-package-name/START-HERE.md`

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

| Phase | Tasks | Time Estimate |
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

## 📚 Document Navigation

| Document | Description |
|----------|-------------|
| **[START-HERE.md](START-HERE.md)** | 👈 You are here |
| [README.md](README.md) | Quick navigation |
| [03-work-package-plan.md](03-work-package-plan.md) | Implementation details |
| [02-kb-research.md](02-kb-research.md) | Knowledge base research |
| [01-implementation-analysis.md](01-implementation-analysis.md) | Implementation analysis |

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

### Document Navigation

Always include links to all documents in the planning folder. Update this table when adding new documents.

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

## Updating START-HERE.md

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
- [ ] Document navigation links all planning docs

---

## Integration with Workflow

This guide supports work package planning:

1. **Create planning folder** → Create START-HERE.md first
2. **Complete planning** → Update status to Ready
3. **During implementation** → Update progress after each task
4. **After completion** → Update status to Complete

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Work Package README](02-readme.md)
- [Work Packages Workflow](../../work-packages/workflow.toon)
