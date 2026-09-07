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

{What forces the decision — the constraint, the requirement, or the problem that makes a choice necessary. Written so a reader who never saw the work package understands why this came up. Facts, not opinions, with measurable baselines where they exist. Split into Technical Forces (constraints, existing systems, dependencies), Business Forces (user needs, stakeholders, timelines) and Operational Forces (deployment, maintenance, scaling) where the decision turns on more than one.}

{Where architectural characteristics drive the decision, a Quality Attribute Requirements table makes them testable: Attribute | Scenario | Measure — e.g. Performance | 1000 concurrent users submit forms | Response < 200ms (95th percentile).}

## Decision Drivers

{The factors the choice turned on, one per line as **[Driver]** - [why it mattered]. Common drivers: performance requirements, development velocity, maintainability, cost, team expertise, time constraints, risk tolerance, identified risks and their severity.}

## Decision

{What was chosen, stated in the present tense as what the system does.}

## Consequences

**Positive:**
- {What becomes easy}

**Negative:**
- {What becomes harder}

**Neutral:**
- {What changes without being better or worse}

## Alternatives Considered

### {Alternative}

{What it was, and the blocking factor or unacceptable trade-off that eliminated it. Rejected options are described fairly — a reader judges the decision by what it turned down.}

{For a multi-criteria choice, a decision matrix carries it: weighted criteria, scores 1-5, weighted scores in parentheses, a total per option.}

[Sections below are optional — omit any that does not apply]

## Related Decisions

{Links to related, non-superseding records and what each shares with this one.}

## Confirmation

{How the decision is validated — the measurable criterion, benchmark, or test that settles it.}

## Compliance

{How adherence is enforced, and how a violation is detected: the governance level (project, team, or organization), the enforcement mechanism (lint rule, structural test, fitness function, review checklist item, CI/CD gate), and the exception process. Carried for standards affecting several teams, security-related decisions, and decisions requiring ongoing adherence.}

## Notes

{Caveats, links to discussions, and considerations not yet decided.}
```

## Rules

- **At least one alternative, with the reason it lost.** A record with no rejected option documents a conclusion rather than a decision.
- **Status opens at Proposed.** Acceptance is recorded later by the finalization step, not asserted here.
- **The optional sections are omitted when empty.** A heading over "none" is a section the reader opens for nothing.
- **The number is the next unused one.** Sequential across the ADR directory; the title slug follows it.
- **Context explains the force, not the history.** Why a decision was needed, not the order in which the run discovered it.
- **Consequences include the costs.** A record listing only benefits is not a trade-off, and the cost is what a later reader most needs.
- **Present tense for the decision.** The record states what the system does, not what the team decided to do, and leads with the decision rather than the argument for it.
- **Line budget:** ~60 lines. Rationale that needs more belongs in the planning artifacts this record links.
