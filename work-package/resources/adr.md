---
name: adr
description: Creation guide for bare filename `NNNN-{decision_title}.md` — the architecture decision record, in standard ADR form, carrying at least one rejected alternative and opening at Proposed status.
metadata:
  order: 32
---

# Architecture Decision Record Guide

Creation guide for the sequentially numbered `NNNN-{decision_title}.md` records. An ADR outlives the work package that produced it, so it is written for someone with no memory of the run: what forced the decision, what was chosen, what that costs, and what was turned down.

## Template

```markdown
# {NNNN}. {Decision title}

**Status:** Proposed

## Context

{What forces the decision — the constraint, the requirement, or the problem that makes a choice necessary. Written so a reader who never saw the work package understands why this came up.}

## Decision

{What was chosen, stated in the present tense as what the system does.}

## Consequences

{What follows — what becomes easy, what becomes harder, and what a future change would have to revisit.}

## Alternatives Considered

### {Alternative}

{What it was, and why it was not chosen.}
```

## Rules

- **At least one alternative, with the reason it lost.** A record with no rejected option documents a conclusion rather than a decision.
- **Status opens at Proposed.** Acceptance is recorded later by the finalization step, not asserted here.
- **The number is the next unused one.** Sequential across the ADR directory; the title slug follows it.
- **Context explains the force, not the history.** Why a decision was needed, not the order in which the run discovered it.
- **Consequences include the costs.** A record listing only benefits is not a trade-off, and the cost is what a later reader most needs.
- **Present tense for the decision.** The record states what the system does, not what the team decided to do.
- **Line budget:** ~60 lines. Rationale that needs more belongs in the planning artifacts this record links.
