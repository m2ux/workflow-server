---
metadata:
  version: 1.0.0
---

## Capability

Research-reconcilable candidates closed until only irreconcilable residue remains.

## Inputs

### research_candidates

The running [inventory](../../resources/research-reconciliation.md#integration-with-research-artifact) of open and resolved candidates to reconcile. On the first pass this is the triaged set; on later passes it also carries any candidates a `request-more` reopened.

### requirements

Work package requirements that scope the targeted research and to which resolved candidates are mapped back.

### problem_statement

The work package problem statement, read alongside `{requirements}` to keep the targeted research in scope.

## Outputs

### research_candidates

The candidate [inventory](../../resources/research-reconciliation.md#integration-with-research-artifact) with every candidate closable by research this pass resolved (finding + citations recorded) and only irreconcilable candidates left open — the same inventory written back in place.

### has_reconcilable_research

Boolean gate driving the loop — true while open research-reconcilable candidates remain (another pass is warranted), false once convergence is reached (only irreconcilable candidates, or none, remain).

### research_document

The research [artifact](../../resources/knowledge-base-research.md#planning-artifact) augmented with the findings gathered while closing candidates this pass, each carrying its source per the group's `url-per-finding` rule.

## Protocol

### 1. Select Reconcilable Candidates

- Read `{research_candidates}`; take the candidates classified reconcilable-by-research
- If none are reconcilable, there is nothing to research — set `{has_reconcilable_research}` false and return; convergence is already reached

### 2. Targeted Research

- For each reconcilable candidate, perform focused research scoped to that candidate: match it to a `concept-rag://activities` entry and follow that technique's tool sequence for institutional knowledge, and use `WebSearch` for current external knowledge where the gap needs it — the same mechanisms as the [research](./research.md) operation, narrowed to the single candidate
- Validate every web finding on the [research](./research.md#source-validation) axes before it informs a resolution
- Determine the outcome: Resolved (research answers the candidate, with citations), Partially Resolved (research narrows it but leaves residual uncertainty), or — when targeted research surfaces that the answer is not published knowledge after all — reclassify the candidate as irreconcilable with its handoff target

### 3. Update the Inventory

- Write each resolution and its citations into the candidate's row in `{research_candidates}` per the [integration shape](../../resources/research-reconciliation.md#integration-with-research-artifact); remove resolved candidates from the open set
- Append the gathered findings to `{research_document}`
- Add any research gap newly surfaced during this pass as a new candidate, classified per [triage](./triage.md#rules)

### 4. Check Convergence

- Re-classify all open candidates after the pass
- If any open candidate is research-reconcilable (including newly surfaced ones), signal another pass is needed — set `{has_reconcilable_research}` true
- If no open candidate is research-reconcilable, convergence is reached per the [convergence-definition](#convergence-definition) — set `{has_reconcilable_research}` false; the remaining open set is irreducible through research
- Present the [scorecard](../../resources/research-reconciliation.md#scorecard) in the session after each pass; do not persist count tables in the artifact — the candidate rows are the record


## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction. Successive passes continue automatically while reconcilable candidates remain; the user sees only the converged inventory at the convergence checkpoint.

### convergence-definition

Convergence is reached when no open candidate in the inventory — including candidates surfaced during a pass — is classified research-reconcilable. Convergence does NOT mean every candidate is resolved: the remaining open set is irreducible through research and requires stakeholder input, operational verification, code analysis, or is out of scope. Each remaining open candidate carries an explicit non-reconcilability rationale and a handoff target.

### classification-transparency

When the converged result is presented, include the classification rationale for every remaining irreconcilable candidate — explain why research cannot resolve it and which handoff target owns it.

### bounded-passes

Each pass must make progress — resolve at least one candidate or reclassify one as irreconcilable. A pass that resolves nothing and surfaces nothing new is treated as converged rather than repeating; this backstops the loop's `maxIterations` bound.
