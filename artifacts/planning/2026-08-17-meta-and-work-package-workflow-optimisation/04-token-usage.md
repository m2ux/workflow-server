# Token usage

Two sessions ran this evaluation. Meta session HZAU7B orchestrated it. Client session PD2H26 ran the prism-evaluate workflow and produced the artifacts. Both ledgers appear below, followed by the coverage gaps that make the totals a floor.

## Client workflow — prism-evaluate (PD2H26)

| Activity | Ledger rows | Tool uses | Duration (min) | Subagent tokens |
| --- | --- | --- | --- | --- |
| scope-definition | 1 | 18 | 3.7 | 71,853 |
| dimension-planning | 1 | 31 | 5.5 | 87,009 |
| execute-analysis | 1 | 106 | 28.1 | 213,175 |
| consolidate-report | 1 | 50 | 17.6 | 302,232 |
| deliver-results | 2 | 19 | 8.4 | 207,706 |
| **Total** | **6** | **224** | **63.3** | **881,975** |

No row carries a model, a price table version or a cost. Cost is unknown for every activity in this table.

Two dispatches covered the closing activity. The first paused at the resolution-offer gate. The second replaced a lost context and finished the activity under the replayed gate response.

The execute-analysis row covers part of that activity only. It comes from a replacement worker dispatched after context loss, and it accounts for the lens 10 degradation pass, the portfolio synthesis and the portfolio run manifest. The dispatch that ran the mechanisation-potential pipeline and the remaining portfolio lenses left no ledger row.

## Meta workflow (HZAU7B)

| Activity | Ledger rows | Tool uses | Duration (min) | Subagent tokens |
| --- | --- | --- | --- | --- |
| discover-session | 1 | 12 | 2.9 | 79,603 |
| initialize-session | 1 | 9 | 1.7 | 51,790 |
| resolve-target | 1 | 7 | 1.4 | 44,713 |
| dispatch-client-workflow | 4 | 100 | 87.4 | 522,896 |
| **Total** | **7** | **128** | **93.4** | **699,002** |

Cost is unknown for every activity in this table as well, for the same reason.

Four dispatches covered dispatch-client-workflow, because that activity holds the whole client run and is resumed at each client gate. Its 87.4 recorded minutes overlap the client durations above rather than adding to them.

## Totals

| Session | Workflow | Subagent tokens | Ledgered duration (min) |
| --- | --- | --- | --- |
| PD2H26 | prism-evaluate | 881,975 | 63.3 |
| HZAU7B | meta | 699,002 | 93.4 |
| **Combined** | | **1,580,977** | see below |

Token sums add across the two sessions. Durations do not, because the meta dispatch rows span the client's own activities. End to end, the ledgered run covers 174.7 minutes, from the meta session start at 06:17:44Z to the last recorded figure at 09:12:25Z. Combined cost is unknown, because no dispatch carried a price table.

## Coverage

| Session | Ledger entries | Dispatch events | Unaccounted |
| --- | --- | --- | --- |
| PD2H26 | 6 | 10 | 4 |
| HZAU7B | 7 | 9 | 2 |

Both totals are a **floor**. Across the two sessions, 19 dispatch events produced 13 ledger rows, leaving 6 dispatches unaccounted.

One of the two meta gaps is this closing activity. The orchestrator records its figure after the worker returns, so it cannot appear in a document the worker writes.

Two prism sub-workflow sessions ran beneath execute-analysis and neither recorded a figure. Session W7EKMS started at 07:07:27Z and completed six activities. Session MVO4PT started at 07:31:30Z. Neither terminal activity recorded an exit, so no wall-clock span is derivable for either and no duration note is given for them.

## What these figures are

Each figure is a harness-reported token count, recorded at an activity boundary by the orchestrator. It is an estimate, not a bill. No price table was applied to any row, so every cost reads unknown. A worker cannot measure itself, so an absent row means nothing was reported rather than nothing was spent.
