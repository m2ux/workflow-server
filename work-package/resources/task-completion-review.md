---
name: task-completion-review
description: Per-task completion review — symbol verification, assumption surfacing, and quality checks before user confirmation.
metadata:
  version: 1.1.0
  order: 14
  legacy_id: 14
---

# Task Completion Review Guide

After completing each implementation task, perform this review before requesting user confirmation. Three mandatory components:

1. **Symbol Verification** — all symbols have provenance in the codebase
2. **Assumption Review** — implicit design decisions surfaced for user validation
3. **Quality Checks** — code, tests, docs meet standards

## 1. Symbol Verification and Quality Checks

Owned by the [task-completion-review](../techniques/task-completion-review.md) technique (bound by the `self-review` step in the implement activity): symbol-provenance procedure (including documentation symbols and the stop-when-unverifiable rule), code/test/documentation quality checklists, and related anti-patterns.

## 2. Assumption Review

After symbol verification, identify assumptions made during implementation.

### Assumption Categories

| Category | Examples |
|----------|----------|
| Behavioral (behavior in specific scenarios) | Defaults, fallbacks, edge-case handling |
| Architectural (structural decisions) | Component boundaries, data flow direction, abstraction levels |
| Interface (API/contract decisions) | Function signatures, return types, error types |
| Performance (speed/memory trade-offs) | Lazy vs eager, caching, algorithm choice |
| Compatibility (backward/forward) | Breaking changes, deprecation, migration paths |
| Scope (included/excluded) | Deferred features, intentional limitations |

### Self-Review Questions

1. What did I assume about requirements? (ambiguities resolved without asking)
2. What alternatives did I reject, and why was this approach chosen?
3. What implicit contracts exist? (undocumented expectations about inputs, ordering, state)
4. What edge cases did I handle or ignore?
5. What would I do differently with more context? (decisions I'm uncertain about)

## Updating the Review Log

After user confirmation, append to the assumptions log artifact:

```markdown
## Task N: [Task Name]

> YYYY-MM-DD · commit `abc123`

### Symbol Verification

All [N] symbols verified. [Exception-only: add a table (Symbol | Type | Provenance | Status) only for symbols that failed verification or needed correction.]

### Assumptions Surfaced

| ID | Category | Assumption | Rationale |
|----|----------|------------|-----------|
| N.1 | [Category] | [Assumption made] | [Why reasonable] |

[If none arose, state "None surfaced" — do not omit this section; the log must show the review was performed.]

### User Response

**Status:** Confirmed | Corrected | Deferred

- [User's response]

### Outcome

All assumptions confirmed; no changes required. [Exception-only: add a table (ID | Original | Outcome | Changes Made) only for corrected or deferred assumptions.]

### Lessons Learned

- [Insights for future tasks. Omit this section if none.]
```

## Rules

- Never skip the self-review or the assumption review — hidden errors and unvalidated design decisions compound across tasks; early surfacing enables course correction.
- When no assumptions arise, still record the section (state "None surfaced") so the log shows the review ran.
