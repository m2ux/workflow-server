---
name: assumption-reconciliation
description: Assumptions-log integration shape, resolution statuses, and scorecard format for assumption reconciliation; the classify-analyze-converge protocol and classification rules live on the review-assumptions reconcile technique.
metadata:
  version: 1.3.0
  order: 26
  legacy_id: 26
---


# Assumption Reconciliation

Activities throughout the work-package workflow produce assumptions — implicit decisions that may or may not hold. Assumption reconciliation resolves the code-resolvable ones autonomously so the user reviews only the irreducible set. The classify-analyze-converge procedure, classification criteria, convergence definition, and interview handoff live on [reconcile](../techniques/review-assumptions/reconcile.md#rules); this resource carries the log-integration shape and scorecard format that protocol consumes.

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

Bold-label entries follow the [markdown-line-breaks](../techniques/manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule: every bold-label line except the last in its group ends with two trailing spaces (`**Status:** Validated⎵⎵`), or consecutive lines collapse into one rendered paragraph. No bullet prefixes as a substitute.

## Scorecard

After reconciliation, present a summary scorecard:

```
Total: N | Validated: N | Invalidated: N | Partially Validated: N | Open: N
Convergence iterations: N | Newly surfaced: N
```

This gives the user an at-a-glance view of how the assumption set evolved through reconciliation. If open assumptions remain, they proceed to judgement augmentation review. If the open count is zero, no user review is needed.
