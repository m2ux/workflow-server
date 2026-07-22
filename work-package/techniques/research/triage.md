---
metadata:
  version: 1.0.0
---

## Capability

Open research candidates classified as reconcilable-by-research or irreconcilable for the reconcile loop.

## Inputs

### findings_synthesis

The synthesized findings connected to requirements; read to detect where a requirement is only partially answered or unsupported by the findings gathered so far.

### applicable_patterns

Patterns mapped to needs during synthesis; read to detect needs that no validated pattern yet covers.

### synthesis_assumptions

Assumptions about pattern applicability recorded during synthesis; each inferred-rather-than-established fit is a candidate research gap.

### requirements

Work package requirements the candidate set is triaged against, so every requirement with an unresolved research question surfaces as a candidate.

### problem_statement

The work package problem statement, read alongside `{requirements}` to scope which gaps are in-scope research candidates.

## Outputs

### research_candidates

The candidate [inventory](../../resources/research-reconciliation.md#integration-with-research-artifact) — one entry per open research gap, each carrying its statement, its classification (reconcilable-by-research or irreconcilable), the classification rationale, and, for irreconcilable candidates, the handoff target. Empty when synthesis left no open gaps.

### has_reconcilable_research

Boolean gate driving the reconciliation loop — true when at least one candidate is classified reconcilable-by-research (another research pass is warranted), false when none are (only irreconcilable candidates, or none, remain).

## Protocol

### 1. Enumerate Candidates

- Read `{findings_synthesis}`, `{applicable_patterns}`, and `{synthesis_assumptions}` against `{requirements}` and `{problem_statement}`
- Surface every open research gap: a requirement the findings only partially answer, a need no validated pattern covers, a contradiction between sources left unresolved, an inferred pattern fit that evidence has not established, a best-practice or library-behaviour question research has not yet settled
- If no open gaps remain, record none — set `{research_candidates}` empty and `{has_reconcilable_research}` false; the convergence checkpoint then presents an empty inventory and the flow proceeds

### 2. Classify Reconcilability

- For each candidate, determine whether further knowledge-base or web research could close it, per the [research-reconcilable](#research-reconcilable) and [research-irreconcilable](#research-irreconcilable) rules
- Record the classification rationale for every candidate; for an irreconcilable candidate, record its handoff target per [handoff-targets](#handoff-targets)

### 3. Seed the Inventory

- Write the candidates to `{research_candidates}` and into the research artifact's Open Research Candidates section per the [integration shape](../../resources/research-reconciliation.md#integration-with-research-artifact)
- Set `{has_reconcilable_research}` true if any candidate is reconcilable-by-research, false otherwise


## Rules

### no-user-interaction

Triage runs autonomously, without user interaction. Candidates and their classifications are surfaced to the user only at the convergence checkpoint, after reconciliation.

### research-reconcilable

A candidate is reconcilable-by-research if further knowledge-base or web research could plausibly close it — the answer exists in documentation, precedent, or published practice and has simply not been gathered yet. Examples:

- "The recommended retry policy for library X is unclear" — official docs or established practice can settle it
- "Sources disagree on whether pattern P applies to async contexts" — more authoritative sources can resolve the contradiction
- "It is unknown whether API A deprecated method M" — changelogs and release notes are researchable
- "No validated pattern yet covers requirement R" — the knowledge base or web may hold one

### research-irreconcilable

A candidate is irreconcilable-by-research if no amount of knowledge-base or web research could close it — it depends on information outside published knowledge. Examples:

- "Stakeholders must choose between approach A and B" — a human decision, not a researchable fact
- "The production data volume for network N is unknown" — a project-specific/operational fact
- "Whether the staging environment already runs version V" — a runtime/environment unknown
- "Which trade-off the team prefers for this module" — a design judgement
- "Behaviour of the internal service S" — not documented in any researchable source

### handoff-targets

Every irreconcilable candidate records where it goes next: `stakeholder` (a decision or operational fact for the downstream assumption interview), `code-analysis` (a claim about this codebase, answerable by the assumption-reconciliation loop), or `out-of-scope` (recorded only, no further action). This keeps irreconcilable research gaps from being lost when research ends.
