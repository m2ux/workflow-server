---
name: task-completion-review
description: Define the review process performed upon completing each implementation task, including verification steps, assumption surfacing, and quality checks.
metadata:
  version: 1.0.0
  order: 14
  legacy_id: 14
---


# Task Completion Review Guide

**Purpose:** Define the review process performed upon completing each implementation task. This guide covers the verification steps, assumption surfacing, and quality checks that ensure work is ready for user confirmation before proceeding to the next task.

**When to use:** After completing each implementation task.

---

## Overview

**After completing each task, perform a task completion review before requesting user confirmation.** This step catches errors, surfaces assumptions, and ensures all changes are grounded in the actual codebase.

The task completion review has three mandatory components:

1. **Symbol Verification** — Ensure all symbols have provenance in the codebase
2. **Assumption Review** — Surface implicit design decisions for user validation
3. **Quality Checks** — Verify code meets quality standards

---

## 1. Symbol Verification and Quality Checks

Symbol verification and quality checks are owned by the [task-completion-review](../techniques/task-completion-review.md) technique, which is bound by the `self-review` step in the implement activity. Refer to that technique for the symbol-provenance procedure (including documentation symbol verification and the stop-when-unverifiable rule) and the code, test, and documentation quality checklists.

---

## 2. Assumption Review

After symbol verification, identify assumptions made during implementation.

### Assumption Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Behavioral** | How the system behaves in specific scenarios | Default values, fallback behavior, edge case handling |
| **Architectural** | Structural decisions about components | Component boundaries, data flow direction, abstraction levels |
| **Interface** | API and contract decisions | Function signatures, return types, error types |
| **Performance** | Trade-offs affecting speed/memory | Lazy vs eager evaluation, caching strategies, algorithm choice |
| **Compatibility** | Backward/forward compatibility | Breaking changes, deprecation handling, migration paths |
| **Scope** | What was included/excluded | Deferred features, intentional limitations |

### Self-Review Questions

After completing a task, review your implementation:

1. **What did I assume about requirements?** — Were there ambiguities I resolved without asking?
2. **What alternatives did I reject?** — Why was this approach chosen over others?
3. **What implicit contracts exist?** — Are there undocumented expectations about inputs, ordering, or state?
4. **What edge cases did I handle (or ignore)?** — How will the code behave in unexpected situations?
5. **What would I do differently with more context?** — Are there decisions I'm uncertain about?

### Why Assumption Review Matters

- Catches misunderstandings before they compound across tasks
- Surfaces design decisions that may conflict with user intent
- Creates opportunities for course correction early
- Documents rationale that would otherwise be lost

---

## Updating the Review Log

After user confirmation, update the assumptions log artifact:

```markdown
## Task N: [Task Name]

**Date:** YYYY-MM-DD
**Commit:** `abc123`

### Symbol Verification

| Symbol | Type | Provenance | Status |
|--------|------|------------|--------|
| `NewTypeName` | struct | `src/module.rs:42` | ✅ Verified |
| `existing_fn` | function | Codebase | ✅ Verified |

### Assumptions Surfaced

| ID | Category | Assumption | Rationale |
|----|----------|------------|-----------|
| N.1 | [Category] | [Assumption made] | [Why reasonable] |

### User Response

**Status:** ✅ Confirmed | 🔄 Corrected | ⏸️ Deferred

**Feedback:**
- [User's response]

### Outcome

| ID | Original | Outcome | Changes Made |
|----|----------|---------|--------------|
| N.1 | [Assumption] | ✅ Confirmed | None required |

### Lessons Learned

- [Insights for future tasks]
```

---

## Anti-Patterns

| Don't | Why |
|-------|-----|
| **Skip self-review after each task** | Hidden errors compound; early detection saves time |
| **Skip the assumption review** | Surfacing design decisions early creates opportunities for course correction before they compound |
| **Omit the phase section from the log when no assumptions arise** | The log should still show that assumption review was performed |

(For symbol-verification and quality-check anti-patterns, see the [task-completion-review](../techniques/task-completion-review.md) technique.)

---

## Quick Reference

### Mandatory Self-Review Steps

1. ✅ **Symbol Verification** — All symbols have provenance (see the [task-completion-review](../techniques/task-completion-review.md) technique)
2. ✅ **Assumption Review** — Design decisions documented
3. ✅ **Quality Checks** — Code, tests, docs meet standards (see the [task-completion-review](../techniques/task-completion-review.md) technique)
4. ✅ **User Checkpoint** — Confirmation before proceeding

---

## Related Guides

- [Assumptions Guide](assumptions-review.md) — Detailed assumption categories and log template
- [Work Package Workflow](../workflow.yaml) — Overall implementation workflow
- [Architecture Review Guide](architecture-review.md) — Architecture decision records
