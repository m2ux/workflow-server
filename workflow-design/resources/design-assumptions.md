---
name: design-assumptions
description: Categories and log template for surfacing and reviewing the design assumptions made while authoring a workflow.
metadata:
  order: 7
---

# Design Assumptions Guide

**Purpose:** Surface, classify, reconcile, and review the design assumptions made while authoring or updating a workflow — the workflow-design counterpart of the work-package [assumptions-review](../../work-package/resources/assumptions-review.md) guide.

The shared methodology — sources of false assumptions, ambiguity sources, risk assessment (High / Medium / Low), the judgement-augmentation review format, best practices, and anti-patterns — is reused wholesale from the [assumptions-review](../../work-package/resources/assumptions-review.md) guide. This guide defines only what is workflow-design-specific: the assumption categories and the log template.

---

## Assumption Categories

Classify each design assumption into one of these categories:

| Category | Description | Examples |
|----------|-------------|----------|
| **Activity Boundaries** | Where one activity ends and the next begins | Whether a concern is its own activity or a step; mode-gating of an activity |
| **Checkpoint Necessity** | Whether a decision point warrants a user checkpoint | Blocking vs auto-advance; which option is the default |
| **Technique Selection** | Which technique a step binds, and reuse vs author | Cross-workflow reference vs workflow-local; an existing op vs a new one |
| **Rule Scope** | Whether a constraint is workflow- or activity-level, and its enforcement | Text-only guidance vs structural (checkpoint / condition / validate) |
| **Variable State** | What state the workflow must track, and its lifecycle | A new variable vs reusing one; default value; producer / consumer |
| **Schema Construct Choice** | Which schema construct expresses a piece of logic | A decision vs a transition; a loop type; an inline checkpoint vs a gate |

---

## Assumptions Log Template

```markdown
# Design Assumptions Log

**Workflow:** [workflow id]
**Mode:** [Create / Update]
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| ... | X | Y | ... | ... | ... |
| **Total** | **X** | **Y** | ... | ... | ... |

---

## Log

One row per assumption, updated in place across its lifecycle — surfaced, reconciled, and resolved.

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | [category] | H/M/L | audit / open | [statement] | [why it seemed reasonable] | ✅ Confirmed / 🔄 Corrected / ⏸️ Deferred | [changes made] |

Resolvability: `audit` = settleable by schema / convention checks; `open` = a genuine design judgement for the user.
```

---

## Related Guides

- [Assumptions Guide (work-package)](../../work-package/resources/assumptions-review.md) — the shared methodology this guide builds on
- [Design Assumption Reconciliation](design-assumption-reconciliation.md)
