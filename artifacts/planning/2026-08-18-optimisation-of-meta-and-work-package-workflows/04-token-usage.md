# Token usage

Two sessions ran this evaluation. Meta session 25EUZ3 orchestrated it. Client session QR6FTR ran the prism-evaluate workflow and produced the artifacts. Both ledgers appear below, followed by the coverage gaps that make the totals a floor.

## Client workflow — prism-evaluate (QR6FTR)

| Activity | Ledger rows | Tool uses | Duration (min) | Subagent tokens |
| --- | --- | --- | --- | --- |
| scope-definition | 3 | 71 | 12.1 | 261,512 |
| dimension-planning | 2 | 33 | 7.0 | 212,092 |
| execute-analysis | 2 | 90 | 146.6 | 237,930 |
| consolidate-report | 1 | 58 | 16.3 | 368,338 |
| deliver-results | 2 | 12 | 4.6 | 171,708 |
| resolution-dialogue | 1 | 5 | 1.6 | 825,176 |
| apply-mitigations | 1 | 15 | 3.4 | 75,299 |
| **Total** | **12** | **284** | **191.6** | **2,152,055** |

No row carries a model, a price table version or a cost. Cost is unknown for every activity in this table.

Three rows cover scope-definition and two cover dimension-planning, because each activity was resumed after its gate and the resumed segment recorded its own figure. Two rows cover deliver-results for the same reason.

The two execute-analysis rows come from different contexts. The first ended without an envelope after the harness reported a stall at 600 seconds with no progress. The second replaced it and returned `activity_complete`. Its 137.2 minutes span an overnight wait rather than continuous work.

The resolution-dialogue row is the largest single figure in either ledger at 825,176 tokens, and it is one row for a dispatch that carried the entire finding-by-finding dialogue across many continuations. Only the final segment recorded tool uses and duration, so the 5 calls and 1.6 minutes on that row describe the closing segment while the token figure describes the whole dialogue.

The apply-mitigations row is the client's terminal activity. It is present here because this document was written after that dispatch returned.

## Meta workflow (25EUZ3)

| Activity | Ledger rows | Tool uses | Duration (min) | Subagent tokens |
| --- | --- | --- | --- | --- |
| discover-session | 1 | 14 | 3.0 | 75,422 |
| initialize-session | 1 | 9 | 1.4 | 54,639 |
| resolve-target | 1 | 8 | 1.4 | 50,149 |
| dispatch-client-workflow | 1 | 23 | 9.8 | 93,027 |
| **Subtotal, meta's own work** | **4** | **54** | **15.6** | **273,237** |
| dispatch-client-workflow (client roll-up) | 1 | — | — | 2,152,055 |
| **Total** | **5** | **54** | **15.6** | **2,425,292** |

Cost is unknown for every activity in this table as well, for the same reason.

The fifth row is not additional spend. It is a roll-up the orchestrator recorded against dispatch-client-workflow for the whole prism-evaluate walk, and it repeats the client total above. It exists because the client run outlived the single dispatch-client-workflow row that carries a duration: that row covers 9.8 minutes, while the client walk it holds ran for two days.

## Totals

| Session | Workflow | Subagent tokens | Ledgered duration (min) |
| --- | --- | --- | --- |
| QR6FTR | prism-evaluate | 2,152,055 | 191.6 |
| 25EUZ3 | meta, own work only | 273,237 | 15.6 |
| **Combined** | | **2,425,292** | **207.2** |

The client figure appears in both ledgers and is counted once. Combined spend is the meta session's own recorded total, because the client roll-up was recorded there.

Durations sum to 207.2 ledgered minutes, but the run spans far more wall-clock than that. End to end it covers 46.1 hours, from the meta session start at 2026-08-18T09:55:55Z to the last recorded figure at 2026-08-20T07:59:47Z. The difference is time waiting at gates: 59 of them, answered across three days. Combined cost is unknown, because no dispatch carried a price table.

## Coverage

| Session | Ledger entries | Fresh dispatches | Unaccounted |
| --- | --- | --- | --- |
| QR6FTR | 12 | 9 | 0 |
| 25EUZ3 | 5 | 6 | 2 |

Fresh dispatches counts distinct worker contexts, not dispatch events. The client session recorded 68 `activity_dispatched` events and the meta session 8, because a continuation past a gate records an event of its own; every client context that took an activity left at least one ledger row.

The meta remainder is two contexts, both on this closing activity. The first was lost to a transient API error before it took the activity and left no row. The second is the one writing this document, and the orchestrator records its figure after the worker returns, so it cannot appear here.

Both totals are a **floor**, and the largest gap is not in either table. Two prism sub-workflow sessions ran beneath execute-analysis: NJOOEH from 2026-08-18T13:53:28Z and HK6JPQ from 2026-08-18T13:59:46Z. Neither recorded a single usage figure, and neither advanced past `structural-pass` in its own session record. The 14 lens analyses under `dimensions/` and `remediation-effect/` — 577,124 bytes of output — were produced by sub-agents that continued outside any dispatch either session owned, after the first execute-analysis worker was killed. That work is real, it is the bulk of the evaluation's output, and no part of its cost reaches these tables.

## What these figures are

Each figure is a harness-reported token count, recorded at an activity boundary by the orchestrator. It is an estimate, not a bill. No price table was applied to any row, so every cost reads unknown. A worker cannot measure itself, so an absent row means nothing was reported rather than nothing was spent.
