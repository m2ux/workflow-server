---
name: assumption-reconciliation
description: Assumptions-log integration shape, resolution statuses, and scorecard format for assumption reconciliation.
metadata:
  version: 1.4.0
  order: 26
  legacy_id: 26
---


# Assumption Reconciliation

Log-integration shape and scorecard format for assumption reconciliation. Status vocabulary and row update rules below; fill the [assumptions log template](assumptions-review.md#assumptions-log-template) accordingly.

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

Scorecard shape (counts only — not persisted in the log):

```
Total: N | Validated: N | Invalidated: N | Partially Validated: N | Open: N
Convergence iterations: N | Newly surfaced: N
```
