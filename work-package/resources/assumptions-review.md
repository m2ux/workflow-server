---
name: assumptions-review
description: Rules for identifying, documenting, and reviewing assumptions across the work package lifecycle, and the single-table assumptions log template.
metadata:
  version: 5.0.0
  order: 13
  legacy_id: 13
---


# Assumptions Guide

Make implicit decisions explicit so they can be validated: after each phase or task, surface the assumptions made, classify them, and track each one in the log until it is resolved. The log is the record of truth for assumptions — one row per assumption, updated in place as it moves through reconciliation and interview. Never restate assumption content in other artifacts (single-source-and-link).

## Surfacing Assumptions

Ask after each phase/task:

- **Requirements** — What did I assume about requirements? Is the information current and valid? Did I treat a preference as a constraint (or vice versa)? What implicit requirements (error handling, logging, security boundaries) did I assume?
- **Design** — What alternatives did I reject, and why? Is this already solved by existing infrastructure, configuration, or an adjacent layer (check build scripts and deployment tools before proposing new code)? Is this the simplest solution? What implicit contracts (inputs, ordering, state) exist? Which edge cases did I handle or ignore?
- **Scope** — What did I assume is out of scope? What would I do differently with more context?
- **Context-free** — Who should have been consulted? Did I solve the right problem? Am I asking the right questions?

Common origins of false assumptions, to check against: missing/stale information, conditions that changed mid-implementation, requirements communicated verbally but never documented, overlooking existing solutions, and interpretation differences (observation, recall, requirement reading, ambiguous problem statements).

## Classification

**Categories** (choose per phase; the bound activity's `assumption_categories` input is the authoritative list): Behavioral, Architectural, Interface, Performance, Compatibility, Scope, Implicit Requirements — plus phase-specific ones (Problem Interpretation, Complexity Assessment, Workflow Path, Requirement Interpretation, Scope Boundaries, Success Criteria Interpretation, Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment, Current Behavior, Gap Identification, Baseline Interpretation, Dependency Understanding, Design Approach, Task Breakdown, Dependency, Test Strategy, Scope Decisions).

**Risk**: **H** — affects multiple components, external interfaces, or security: validate before proceeding. **M** — affects current task scope: confirm at checkpoint. **L** — easily reversible: log for reference, batch validation acceptable.

## Rules

- **Be specific and include rationale** — a vague assumption without its "why" cannot be validated.
- **Document confirmations, not just corrections** — the audit trail explains decisions to future maintainers.
- **Update the row when the resolution happens** — assumptions are harder to recall accurately later.
- **Record trade-offs for architectural assumptions** — the alternatives considered and why one was chosen (this feeds the open-assumption decision space).
- **One row per assumption** (state-once-per-artifact): no separate surfaced/response/outcome sections, no per-phase count tables, no closing recap. The table IS the record.
- **No null ceremony**: a phase with no significant assumptions gets one row — `— | [Phase] | — | — | No significant assumptions ([reason]) | — | —`. Do not ask the user to confirm a null result; record it and proceed.

## Judgement Augmentation Review

After `review-assumptions::reconcile` converges, only stakeholder-dependent assumptions remain open. Present those per the [interview](../techniques/review-assumptions/interview.md) operation: decision space and trade-offs first, agent's position last (reduces anchoring), reversibility flagged, ordered by decision impact, grouped by theme when 5+. If reconciliation resolved everything, present a one-line summary — no user input needed.

## Assumptions Log Template


**Template:**

```markdown
# Assumptions Log

> [Work package] · #[issue] · updated YYYY-MM-DD

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | [Statement] — [why this seemed reasonable] | Code: `src/x.rs:42-58` [finding] | Validated |
| PL-1 | Planning | Design Approach | H | [Statement] — [why] | User interview | Corrected: [what changed] |
| 1.1 | Task 1 | Behavioral | L | [Statement] — [why] | — | Open ([why stakeholder-dependent]) |

Resolution: how it was settled — `Code:` with file:line evidence, `User` (checkpoint or
interview), or `—` while open; implementation-task rows append the commit hash for
assumption-to-commit traceability. Outcome: Validated / Invalidated / Partially Validated
(code-resolved) · Confirmed / Corrected: <change> / Deferred: <follow-up> (user-resolved)
· Open (<reason>). When an interpretation difference contributed to an assumption, name
the ambiguity source (observation, recall, requirement reading, ambiguous problem
statement) in the rationale.

## Open Assumptions

Full decision-space entries ONLY for currently-open stakeholder-dependent assumptions
(bold-label format, trailing-space rule — see the
[formatting rule](assumption-reconciliation.md#markdown-formatting-rule)). Remove each
entry when it resolves — its outcome lives in its Log row. Omit the section when empty.

### PL-1: Short title
**Assumption:** [statement]  
**Decision space:** [alternatives, with the trade-offs that differentiate them]  
**Why not code-resolvable:** [classification rationale]  
**Technical context:** [evidence gathered during reconciliation]  
**Agent's position:** [favored alternative and why — stated after the alternatives]  
**Reversibility:** easily-reversible | path-committing

## Wrap-Up

At completion, exception-only: "N assumptions — all validated/confirmed" is one line.
Add bullets ONLY for corrected, invalidated, or deferred assumptions, plus one takeaway
line if a pattern emerged. Deferred follow-ups are canonically tracked in COMPLETE.md
Deferred Items — link them, don't duplicate.
```
