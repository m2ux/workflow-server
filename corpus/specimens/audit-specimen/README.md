# Audit Specimen

One planted defect, one fix, and a re-audit. Walk it on the sidecar after the MVW, with the engine from `i09/main` and this corpus.

Walk it as `workflow_id: audit-specimen`.

## Claims

| Claim | Artifact | Holds when |
| --- | --- | --- |
| One fix round | `{reaudit_finding_count}` | The re-audit records no finding |
| Author load set | `{units_listed}`, `{units_used}` | The two lists are equal |
| Full ledger | `{unit_ledger}` | One row per canon unit at this commit, each `walked` or `not-applicable` |

The planted sentence is in [subject](techniques/subject.md) `## Capability`: `It does not use inline content.` The close step removes it.
