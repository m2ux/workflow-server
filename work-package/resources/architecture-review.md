---
name: architecture-review
description: Guidelines for conducting architecture reviews that evaluate design decisions against quality attributes, constraints, and trade-offs. Produces an Architecture Decision Record (ADR).
metadata:
  version: 1.1.0
  order: 15
  legacy_id: 15
---


# Architecture Review Guide

Architecture review evaluates significant design decisions against quality attributes, constraints, and trade-offs, and records them as an **Architecture Decision Record (ADR)** — a lightweight document capturing one decision with its context, rationale, and consequences.

## ADRs Document Decisions, Not Design

An ADR records *what* was decided and *why*; the design work that determines *how* comes afterward.

- Include: the decision and rationale; requirements and constraints; trade-offs between options; expected consequences.
- Exclude: file paths or module names; code snippets or API signatures; implementation steps; testing strategies.
- Ticket references describe requirements, not implementation: "TICKET-1234 requires that X be abstracted behind a configurable provider" — not "TICKET-1234 introduces a `FooProvider` trait in `src/foo.ts`".

## Architectural Significance

A decision is architecturally significant when it:

1. Affects system-wide quality attributes (performance, security, scalability, maintainability)
2. Establishes a precedent other decisions will follow
3. Involves significant trade-offs between competing quality attributes
4. Is difficult or costly to reverse
5. Crosses component boundaries (multiple modules or services)
6. Introduces new constraints limiting future design options

Further signals: future developers need to understand why; changes core abstractions or data models.

**Threshold: 3+ criteria met → create an ADR.**

Also write an ADR when choosing between multiple valid approaches with different trade-offs, introducing a new pattern/library/framework, or changing existing architecture or conventions.

**Skip an ADR for:** trivial or easily reversible decisions; standard patterns followed without deviation; cosmetic/stylistic changes; bug fixes (including complex multi-file fixes); refactoring without behavior change; minor features; performance optimizations (unless architecturally significant).

## Timing

Create the ADR **after implementation is complete**, not before — decisions are not finalized until implementation constraints are encountered. Commit the ADR and proceed to the validate activity.

Initial status: **Accepted** is typical (implementation validates the decision); **Proposed** only when additional review/approval is needed before merging; **RFC** when seeking broader input before finalizing.

## Decision-Making Discipline

Avoid three progressive anti-patterns (Ford & Richards): **Covering Your Assets** (vague, hedged non-decisions — state the decision clearly with rationale); **Groundhog Day** (undocumented decisions get re-debated — write it down once, reference it forever); **Email-Driven Architecture** (decisions scattered across email/Slack/meetings — centralize in ADRs; email is for communication, not documentation).

## Section Rules

### Status

Vocabulary: **Accepted** (final, implementation complete — typical initial status) · **Proposed** (needs governance review before PR merge — rare) · **RFC** (seeking broader input) · **Deprecated** (no longer recommended, may still exist in codebase) · **Superseded by ADR-XXXX**.

Lifecycle: `RFC → Accepted → Superseded | Deprecated`. Deprecated/superseded ADRs remain for historical reference.

Superseding requires **bidirectional linking** — the old ADR must point forward, the new one back:

New ADR: `Accepted` + `Supersedes: ADR: Old Decision` · Old ADR: `Superseded by ADR: New Decision`

### Context

Describe circumstances that directly influence the decision, split into `### Technical Forces` (constraints, existing systems, dependencies), `### Business Forces` (user needs, stakeholders, timelines), `### Operational Forces` (deployment, maintenance, scaling). Facts, not opinions; include measurable baseline metrics when available; describe current state objectively.

When architectural characteristics drive the decision, add a Quality Attribute Requirements table to make them concrete and testable:

| Attribute | Scenario | Measure |
|-----------|----------|---------|
| Performance | When 1000 concurrent users submit forms | Response < 200ms (95th percentile) |

### Decision Drivers

Numbered list, `**[Driver]** - [why it matters]`. Common drivers: performance requirements, development velocity, maintainability, cost, team expertise, time constraints, risk tolerance, identified risks and their severity, risk-mitigation requirements.

### Considered Options

- Include at least 2-3 options; clearly mark the selected one; list pros and cons per option.
- Be fair to rejected options; for each, explicitly state the blocking factor or unacceptable trade-off that eliminated it.
- For complex multi-criteria decisions, optionally add a decision matrix: weighted criteria, scores 1-5, weighted scores in parentheses, totals per option.

### Decision

Lead with the decision, not the explanation: "Implement **Option N** because [primary rationale]." Keep rationale brief (detail lives in Context/Options). List constraints that bound the solution space, not implementation details.

### Consequences

Document expected outcomes under **Positive** / **Negative** / **Neutral**. This makes trade-offs explicit and traceable, records what was knowingly accepted, and supports later validation.

### Related Decisions (optional)

Links to related non-superseding ADRs with a brief note on the relationship — decisions that build on, adjoin, or share constraints with this one.

### Confirmation (optional, recommended)

How the decision will be validated (code review verification, benchmarks, proof of concept, integration tests, monitoring), plus **measurable** success criteria.

### Compliance (optional)

Include for standards affecting multiple teams, security-related decisions, or decisions requiring ongoing adherence. Cover: governance level (project / team / organization-ARB), enforcement mechanisms (lint rule, structural test, fitness function, review checklist item, CI/CD gate), how violations are detected, and the exception process.

### Notes (optional)

Historical context, links to discussions/RFCs, caveats, future considerations not yet decided.

## ADR Template

```markdown
# ADR: [Descriptive Title]

## Status
[Proposed | RFC | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context
[Describe the forces at play - technical, business, operational]

## Decision Drivers
[List the key factors influencing this decision]

## Considered Options
[List alternatives with pros/cons; mark the selected option; state each rejected option's blocking factor]

| Option | Pros | Cons |
|--------|------|------|
| Option A | Pro 1, Pro 2 | Con 1, Con 2 |
| Option B | Pro 1, Pro 2 | Con 1, Con 2 |

## Decision
[State the decision and key design choices]

## Consequences

**Positive:**
- [Benefit]

**Negative:**
- [Tradeoff]

**Neutral:**
- [Observation]

[Sections below are optional — omit any that do not apply]

## Related Decisions
[Links to related (non-superseding) ADRs]

## Confirmation
[How will we validate the decision was correct? Measurable success criteria]

## Compliance
[How will we ensure the decision is followed?]

## Notes
[Additional context, caveats, or links that don't fit elsewhere]

## References
[Hyperlinked references — internal ADRs via relative paths, external resources with full URLs]
```

## Naming, Storage, Scope

- File name: `NNNN-` sequential prefix + kebab-case descriptive name, e.g. `0001-typescript-nodejs-runtime.md`, `0002-vector-storage.md`. Concise but meaningful.
- ADRs are committed to the repository. Changes to accepted ADRs are new superseding ADRs. Link ADRs in PR descriptions when relevant.
- Scope: **Project** (this codebase — ADR folder), **Team** (multiple projects — shared team docs repo), **Organization** (all teams — central architecture docs). Start at project scope and escalate only if the decision affects others; reference organization-wide ADRs from project ADRs; keep project ADRs in the project repository for discoverability.
- Tooling: plain Markdown files with consistent naming are sufficient for most projects; consider ADR-tools or Log4brains only at 20+ ADRs or multi-team coordination.

## Writing Style

- Clear, technical language; be specific about trade-offs; include measurable criteria; focus on the "why", not just the "what"; keep to 1-2 pages; describe the paths not taken explicitly.
- No vague language ("might be better", "could help"); don't hide negative consequences; no implementation details; don't confuse requirements with implementation; link planning artifacts instead of inlining their content (single-source-and-link); no process attribution ("per user request", "AI suggested").
