---
name: assumption-reconciliation
description: Resolvability classification, assumptions-log integration shape, resolution statuses, and scorecard format for assumption reconciliation.
metadata:
  version: 1.4.0
  order: 26
  legacy_id: 26
---


# Assumption Reconciliation

Log-integration shape and scorecard format for assumption reconciliation. Status vocabulary and row update rules below; fill the [assumptions log template](assumptions-review.md#assumptions-log-template) accordingly.

## Resolvability Classification

Which assumptions code analysis can settle, and which it cannot. Every open assumption takes one of these three classifications, and the classification is what decides whether another analysis pass is warranted.

### Code-resolvable

An assumption is code-resolvable where targeted reading, searching or diffing of the codebase could validate or invalidate it — code behaviour, data flows, type structures, API contracts, test coverage, implementation detail, library behaviour, ordering guarantees, error-handling paths.

| Assumption | What settles it |
|---|---|
| Function X produces deterministic output | Trace the implementation |
| The test suite covers scenario Y | Search for the relevant test cases |
| Data flows through path Z | Trace from source to sink |
| Library version A changed behaviour B | Diff between tags |
| Type T uses collection C internally | Read the type definition |
| Error handling follows pattern P | Grep for error propagation |
| Module M depends on module N | Check the imports and the manifest |
| The override mechanism handles edge case E | Read the guard conditions |

### Not code-resolvable

An assumption is not code-resolvable where it turns on information outside the codebase — stakeholder decisions, operational questions, strategic judgements, time estimates, deployment status, business priorities, external-system behaviour.

| Assumption | What it would take |
|---|---|
| Stakeholders will approve approach A | A human decision |
| Override data is complete for network N | Operational verification |
| The timeline estimate is realistic | A judgement call |
| The deployment succeeded on environment E | Runtime evidence |
| Business priority favours option X over Y | A strategic decision |
| External service S behaves to spec | Integration testing |

### Partially resolvable

Code analysis narrows the uncertainty without eliminating it. The assumption is marked Partially Validated, carrying the evidence gathered and a note on what remains open. Where further analysis would not help, it reclassifies as not code-resolvable.

### Convergence

Convergence is reached when no open assumption in the log — including any surfaced during analysis — classifies as code-resolvable. It does not mean every assumption is resolved: the remaining set is irreducible through code analysis and needs stakeholder input, operational verification or other external information. At convergence, every code-resolvable assumption carries a resolution status, every resolution cites file paths and code evidence, no newly surfaced assumption classifies as code-resolvable, and each remaining open assumption carries an explicit reason for its non-resolvability.

## Integration with Assumptions Log

### Resolution statuses

| Status | Meaning |
|--------|---------|
| Validated | Code evidence confirms the assumption holds |
| Invalidated | Code evidence refutes the assumption |
| Partially Validated | Evidence supports with caveats or limitations |
| Open | Not yet resolved — includes reason (requires stakeholder input, requires operational verification, etc.) |

### Log structure after reconciliation

The log holds one table row per assumption (see the [assumptions log template](assumptions-review.md#assumptions-log-template)); reconciliation updates rows in place:

- A **resolved** assumption's row records the finding and evidence (file paths, line numbers, commit hashes) in the Resolution column and Validated / Invalidated / Partially Validated in the Outcome column. No standalone per-assumption section is kept for resolved assumptions.
- An **open** assumption keeps its row (Outcome `Open (<reason>)`) plus a full bold-label entry under Open Assumptions carrying the classification rationale (why code analysis cannot resolve it) and what external input would resolve it. The entry is removed when the assumption resolves.

### Markdown formatting rule

Bold-label entries follow the [markdown-line-breaks](../techniques/manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule.

## Scorecard

Scorecard shape (counts only — not persisted in the log):

```
Total: N | Validated: N | Invalidated: N | Partially Validated: N | Open: N
Convergence iterations: N | Newly surfaced: N
```
