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

## Outputs

### research_candidates

The candidate [inventory](../../resources/research-reconciliation.md#inventory-shape) — one entry per open research gap, each carrying its statement, its classification (reconcilable-by-research or irreconcilable), the classification rationale, and, for irreconcilable candidates, the handoff target. Empty when synthesis left no open gaps.

### has_reconcilable_research

Boolean gate driving the reconciliation loop — true when at least one candidate is classified reconcilable-by-research (another research pass is warranted), false when none are (only irreconcilable candidates, or none, remain).

## Protocol

### 1. Enumerate Candidates

- Read `{findings_synthesis}`, `{applicable_patterns}`, and `{synthesis_assumptions}` against `{requirements}` and `{problem_statement}`
- Surface every open research gap: a requirement the findings only partially answer, a need no validated pattern covers, a contradiction between sources left unresolved, an inferred pattern fit that evidence has not established, a best-practice or library-behaviour question research has not yet settled
- If no open gaps remain, record none — set `{research_candidates}` empty and `{has_reconcilable_research}` false

### 2. Classify Reconcilability

- For each candidate, determine whether further knowledge-base or web research could close it, per the [Reconcilability statuses](../../resources/research-reconciliation.md#reconcilability-statuses)
- Record the classification rationale for every candidate; for an irreconcilable candidate, record its target per [Handoff targets](../../resources/research-reconciliation.md#handoff-targets)

### 3. Seed the Inventory

- Write the candidates to `{research_candidates}` and into the research artifact's Open Research Candidates section per the [integration shape](../../resources/research-reconciliation.md#inventory-shape)
- Set `{has_reconcilable_research}` true if any candidate is reconcilable-by-research, false otherwise

## Rules

### every-candidate-carries-its-rationale

A candidate's classification is recorded with the reason it holds, and an irreconcilable one with the handoff target that owns it, so no gap is lost when research ends.
