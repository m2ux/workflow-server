---
name: assumptions-review
description: Assumptions log template plus category, risk, and probe vocabulary for filling log rows.
metadata:
  version: 5.3.0
  order: 13
  legacy_id: 13
---


# Assumptions Guide

The assumptions log is the single record of truth for assumptions — one row per assumption, updated in place. Never restate assumption content in other artifacts (single-source-and-link).

## Probe Vocabulary

Consult these prompts when filling Log rows (they do not prescribe session cadence):

- **Requirements** — Ambiguities resolved without asking; information currency; preference treated as constraint (or vice versa); implicit requirements (error handling, logging, security boundaries).
- **Design** — Alternatives rejected and why; existing infrastructure / config / adjacent layer; simplest solution; implicit contracts (inputs, ordering, state); edge cases handled or ignored.
- **Scope** — What is out of scope; what would change with more context (uncertain decisions).
- **Context-free** — Who should have been consulted; whether the right problem is being solved; whether the right questions are being asked.

Common origins of false assumptions: missing/stale information, conditions that changed mid-implementation, requirements communicated verbally but never documented, overlooking existing solutions, and interpretation differences (observation, recall, requirement reading, ambiguous problem statements).

## Classification Vocabulary

**Categories** (choose per phase; the category list supplied for the current collection pass is authoritative): Behavioral (defaults, fallbacks, edge-case handling), Architectural (component boundaries, data flow direction, abstraction levels), Interface (function signatures, return types, error types), Performance (lazy vs eager, caching, algorithm choice), Compatibility (breaking changes, deprecation, migration paths), Scope (deferred features, intentional limitations), Implicit Requirements (unstated needs assumed present or absent) — plus phase-specific ones (Problem Interpretation, Complexity Assessment, Workflow Path, Requirement Interpretation, Scope Boundaries, Success Criteria Interpretation, Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment, Current Behavior, Gap Identification, Baseline Interpretation, Dependency Understanding, Design Approach, Task Breakdown, Dependency, Test Strategy, Scope Decisions).

**Risk letters** (column vocabulary): **H** — affects multiple components, external interfaces, or security. **M** — affects current task scope. **L** — easily reversible.

## Fill Rules

- **Be specific and include rationale** — a vague assumption without its "why" cannot be validated.
- **Document confirmations, not just corrections** — the audit trail explains decisions to future maintainers.
- **Update the row when the resolution happens** — assumptions are harder to recall accurately later.
- **Record trade-offs for architectural assumptions** — the alternatives considered and why one was chosen (this feeds the open-assumption decision space).
- **One row per assumption** (state-once-per-artifact): no separate surfaced/response/outcome sections, no per-phase count tables, no closing recap. The table IS the record.
- **Null row format**: a phase with no significant assumptions gets one row — `— | [Phase] | — | — | No significant assumptions ([reason]) | — | —`.

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
[markdown-line-breaks](../techniques/manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule). Remove each
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
line if a pattern emerged. Deferred follow-ups are canonically tracked in the
[deferred-items register](deferred-items.md) — link them, don't duplicate.
```
