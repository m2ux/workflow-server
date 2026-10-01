# Audit Specimen

One planted defect, one fix, and a re-audit. Walk it on the sidecar after the MVW, with the engine from `i09/main` and this corpus.

Walk it as `workflow_id: audit-specimen`.

`scripts/attest.py` reports the three claims. `baseline-rounds.txt` holds the baseline audit's round count.

## Claims

| Claim | Holds when the attest script exits 0 |
| --- | --- |
| One fix round | The specimen round count is 1, below the baseline count, and the re-audit findings file is empty |
| Author load set | The author headings equal the listing headings, and each author row records an application result |
| Full ledger | The ledger ids equal the inventory command's ids, each `walked` or `not-applicable` |

The planted sentence is in [subject](techniques/subject.md) `## Capability`: `It does not use inline content.` The close step removes it.
