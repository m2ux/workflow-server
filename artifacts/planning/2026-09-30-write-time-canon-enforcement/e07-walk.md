# Audit specimen walk

Sidecar `workflow-server-exp` at `http://127.0.0.1:32772/mcp`. Image `workflow-server:exp-audit-specimen`. Engine pin `7dc26dba-dirty` (host compile). Corpus pin `a475c334`, the specimen commit before the listing command stopped naming a program path.

MVW session `ZZRDNM` reached `__terminal__` on exit `dispatched`.

Specimen session `2GU6SZ`, workflow `audit-specimen`, planning folder `2026-10-01-audit-specimen`. The activity `score` reached `__terminal__` on exit `scored`.

## Claims

| Claim | Result |
| --- | --- |
| One fix round | The planted sentence was an AP-41 finding. After it was deleted, the capability paragraph is `Record that a dispatch ran.` The re-audit count is 0. |
| Author load set | The listing command for `technique.capability` printed 85 units. `{units_used}` is that same list. |
| Full ledger | 281 rows at this engine and corpus: 165 anti-pattern entries, 12 families, 47 principles, Reference Conventions, and 56 guard registry entries. 235 walked, 46 not-applicable. |

A not-applicable row quotes the unit's Fires-on line, which names constructs other than a technique file. A walked row was judged from that unit's Detect sentence against `techniques/subject.md`. The only match is AP-41 on `It does not use inline content.`

The ledger is [e07-unit-ledger.md](e07-unit-ledger.md). The listing is [e07-units-listed.txt](e07-units-listed.txt).

## Scoring pass

Corpus pin `36cff4f0`. Engine pin `7dc26dba-dirty`. MVW session `WFR2OV` reached `__terminal__` on exit `dispatched`. Specimen session `OAGNJZ` reached `__terminal__` on exit `scored`.

`scripts/attest.py check` exited 0. The specimen round count is 1, below the baseline count of 4. The author file has 85 headings, each with an application result, matching the listing. The ledger has 283 inventory ids. The re-audit findings file is empty. The first audit records the planted sentence under AP-41.

