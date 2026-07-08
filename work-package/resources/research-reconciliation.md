---
name: research-reconciliation
description: Research-candidate inventory shape, reconcilability statuses, and scorecard format for research reconciliation; the enumerate-classify-converge protocol and classification rules live on the research triage and reconcile techniques.
metadata:
  version: 1.0.0
  order: 27
---


# Research Reconciliation

The research activity surfaces research candidates — open gaps between what the findings establish and what the requirements need. Research reconciliation closes the research-reconcilable candidates autonomously so the user reviews only the irreducible set, and it decides when research is objectively done: research continues while a reconcilable candidate remains and ends when none — or only irreconcilable candidates — remain. The enumerate-classify-converge procedure, classification criteria, and convergence definition live on [triage](../techniques/research/triage.md#rules) and [reconcile](../techniques/research/reconcile.md#rules); this resource carries the inventory shape and scorecard format that protocol consumes.

## Integration with Research Artifact

The candidate inventory lives in an **Open Research Candidates** section of the research [artifact](knowledge-base-research.md#planning-artifact) (`kb-research.md`), one table row per candidate, updated in place across passes.

### Reconcilability statuses

| Status | Meaning |
|--------|---------|
| Reconcilable | Open — further knowledge-base or web research could close it; a research pass is warranted |
| Resolved | Research closed it; the finding and its citations are recorded |
| Partially Resolved | Research narrowed it; residual uncertainty and what remains are noted |
| Irreconcilable | Research cannot close it — carries the non-reconcilability rationale and a handoff target |

### Handoff targets

Every irreconcilable candidate records where it goes when research ends, so no gap is lost:

| Target | Meaning |
|--------|---------|
| stakeholder | A decision or operational fact — carried into the downstream assumption interview |
| code-analysis | A claim about this codebase — answerable by the assumption-reconciliation loop |
| out-of-scope | Outside this work package — recorded only, no further action |

### Section structure

- A **Resolved** or **Partially Resolved** candidate's row records the finding and its citations in the Resolution column and the status in the Outcome column.
- An **Irreconcilable** candidate keeps its row (Outcome `Irreconcilable (<target>)`) plus a bold-label entry carrying the rationale (why research cannot resolve it) and the handoff target. The entry is removed only if a later pass or a `request-more` reopens and resolves it.

### Markdown formatting rule

Bold-label entries follow the [markdown-line-breaks](../techniques/manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule: every bold-label line except the last in its group ends with two trailing spaces, or consecutive lines collapse into one rendered paragraph. No bullet prefixes as a substitute.

## Scorecard

After each reconciliation pass, present a summary scorecard:

```
Total: N | Resolved: N | Partially Resolved: N | Reconcilable (open): N | Irreconcilable: N
Passes: N | Newly surfaced: N
```

This gives an at-a-glance view of how the candidate set converged. When the Reconcilable (open) count reaches zero, research has converged and the convergence checkpoint presents the full inventory. If the Irreconcilable count is also zero, research resolved every candidate.
