---
name: design-assumptions
description: Categories and log template for the assumptions-log planning artifact in workflow-design sessions.
metadata:
  order: 7
---

# Design Assumptions Guide

Creation guide for bare filename `assumptions-log.md`. Design-time assumption categories and log shape — the workflow-design counterpart of the work-package [assumptions-review](../../work-package/resources/assumptions-review.md) guide. Shared methodology (false-assumption sources, risk assessment, judgement-augmentation review) is reused from that guide; this resource owns the design-session log layout.

## Assumption Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Activity Boundaries** | Where one activity ends and the next begins | Whether a concern is its own activity or a step; mode-gating of an activity |
| **Checkpoint Necessity** | Whether a decision point warrants a user checkpoint | Blocking vs auto-advance; which option is the default |
| **Technique Selection** | Which technique a step binds, and reuse vs author | Cross-workflow reference vs workflow-local; an existing op vs a new one |
| **Rule Scope** | Whether a constraint is workflow- or activity-level, and its enforcement | Text-only guidance vs structural (checkpoint / condition / validate) |
| **Variable State** | What state the workflow must track, and its lifecycle | A new variable vs reusing one; default value; producer / consumer |
| **Schema Construct Choice** | Which schema construct expresses a piece of logic | A decision vs a transition; a loop type; an inline checkpoint vs a gate |

## Resolvability

| Value | Meaning |
|-------|---------|
| `audit` | Settleable by schema / convention / principle checks — see [design-assumption-reconciliation](./design-assumption-reconciliation.md) |
| `open` | Genuine design judgement — batched into Gate 2 (`approve-to-commit`) after reconcile |

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
```

## Rules

- **Bare filename** `assumptions-log.md` — design sessions fill **this** template (not the work-package assumptions-review shape), including when collect/record ops are borrowed from work-package.
- **Table is the record** — no prose duplicate of the log elsewhere (README / COMPLETE link here).
- **One row per assumption**, updated in place through reconcile; open judgements batch into Gate 2.
- **Null ceremony:** if none significant, one row stating that — do not prompt the user to confirm null.
- **Categories** come from the activity's `assumption_categories` input (design set above).
- **Line budget:** summary + log rows only; keep under ~80 lines unless the open-judgement set is large.
