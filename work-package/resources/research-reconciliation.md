---
name: research-reconciliation
description: Research-candidate inventory shape, reconcilability statuses, and scorecard format for research reconciliation.
metadata:
  version: 1.1.0
  order: 27
---


# Research Reconciliation

Inventory shape and scorecard format for research candidates — open gaps between what findings establish and what requirements need. Status and handoff-target vocabulary below.

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

Every irreconcilable candidate records where the gap goes next so none is lost:

| Target | Meaning |
|--------|---------|
| stakeholder | A decision or operational fact outside research |
| code-analysis | A claim about this codebase answerable by code evidence |
| out-of-scope | Outside this work package — recorded only, no further action |

### Section structure

- A **Resolved** or **Partially Resolved** candidate's row records the finding and its citations in the Resolution column and the status in the Outcome column.
- An **Irreconcilable** candidate keeps its row (Outcome `Irreconcilable (<target>)`) plus a bold-label entry carrying the rationale (why research cannot resolve it) and the handoff target. The entry is removed only if a later pass reopens and resolves it.

### Markdown formatting rule

Bold-label entries follow the [markdown-line-breaks](../techniques/manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule: every bold-label line except the last in its group ends with two trailing spaces, or consecutive lines collapse into one rendered paragraph. No bullet prefixes as a substitute.

## Scorecard

Scorecard shape (counts only — not persisted in the inventory):

```
Total: N | Resolved: N | Partially Resolved: N | Reconcilable (open): N | Irreconcilable: N
Passes: N | Newly surfaced: N
```
