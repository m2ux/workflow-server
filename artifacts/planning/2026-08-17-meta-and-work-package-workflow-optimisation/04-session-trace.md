# Session trace

Mechanical record of the dispatches behind this evaluation. Cost figures live in [token usage](04-token-usage.md) and are not restated here.

## Sessions

| Session | Workflow | Version | Started (UTC) | Activities completed |
| --- | --- | --- | --- | --- |
| HZAU7B | meta | 5.22.0 | 06:17:44 | 4 of 5 |
| PD2H26 | prism-evaluate | 1.3.0 | 06:23:19 | 4 of 5 |
| W7EKMS | prism | 2.4.0 | 07:07:27 | 6 |
| MVO4PT | prism | 2.4.0 | 07:31:30 | 0 |

The two prism sessions were triggered from the client execute-analysis activity, one for the full-prism pipeline and one for the portfolio run.

## Dispatches — meta

| Activity | Worker | Tool calls | Duration (min) |
| --- | --- | --- | --- |
| discover-session | worker-00-discover-session-a | 12 | 2.9 |
| initialize-session | worker-01-initialize-session-a | 9 | 1.7 |
| resolve-target | worker-02-resolve-target-a | 7 | 1.4 |
| dispatch-client-workflow | worker-03-dispatch-client-workflow-a | 22 | 8.1 |
| dispatch-client-workflow | worker-03-dispatch-client-workflow-a | 29 | 12.8 |
| dispatch-client-workflow | worker-03-dispatch-client-workflow-b | 36 | 58.0 |
| dispatch-client-workflow | worker-03-dispatch-client-workflow-b | 13 | 8.5 |

The meta session recorded 9 dispatch events against these 7 rows.

## Dispatches — client

| Activity | Worker | Tool calls | Duration (min) |
| --- | --- | --- | --- |
| scope-definition | worker-00-scope-definition-a | 18 | 3.7 |
| dimension-planning | worker-01-dimension-planning-a | 31 | 5.5 |
| execute-analysis | worker-execute-analysis-b | 106 | 28.1 |
| consolidate-report | worker-consolidate-report-a | 50 | 17.6 |
| deliver-results | worker-deliver-results-a | 7 | 4.1 |
| deliver-results | worker-deliver-results-b | 12 | 4.3 |

The client session recorded 10 dispatch events against these 6 rows. Neither prism session recorded a dispatch row of its own.

## Gates

| Session | Checkpoint | Response | Variable set | Answered (UTC) |
| --- | --- | --- | --- | --- |
| PD2H26 | scope-definition confirm-scope | accept | scope_confirmed = true | 06:43:10 |
| PD2H26 | dimension-planning confirm-plan | accept | dimensions_confirmed = true | 07:01:51 |
| PD2H26 | deliver-results resolution-offer | external | resolution_requested = false | 09:03:34 |

The meta session reached no gate of its own before this closing activity. The client session recorded one checkpoint replay, against the resolution-offer gate.

## Variable writes

| Session | Variable-set events | Written by a gate |
| --- | --- | --- |
| HZAU7B | 17 | 0 |
| PD2H26 | 23 | 3 |

The remaining writes landed from worker result envelopes. The session history projection reports event counts only, so per-event attribution beyond the gate writes above is not available from the record.

## Faults

Two dispatches were lost to context exhaustion, and the ledger notes record both.

- The first execute-analysis worker in the client session was lost. Worker worker-execute-analysis-b replaced it and finished the activity. The lost worker's figure was never recorded, which is the largest single gap in the ledger.
- The resumed deliver-results worker was lost after the resolution-offer gate. Worker worker-deliver-results-b replaced it and completed the activity under the replayed gate response.

The meta dispatch-client-workflow activity was carried by two worker identities in sequence. The ledger records no reason for the change.

The client session recorded two activity redeliveries, consistent with the two replacements above.

## Terminal-activity exits

No session in this run recorded an exit for its terminal activity. The client deliver-results activity finished and both its dispatch figures reached the ledger, yet the session record still shows that activity as current. A terminal activity has no next activity to transition to, so nothing writes its exit event. The same holds for both prism sessions.

The practical consequence is narrow. Ledger rows for a terminal activity are present whenever the orchestrator recorded them, so cost coverage does not depend on the missing exit event. Completed-activity counts read one short of the truth.

## Artifacts

The client run produced 19 files under the planning folder: 2 at the root, 7 under `mechanisation-potential/`, and 10 under `dimensions/`. All 19 are present on disk. The evaluation report is the delivered artifact, at 77,940 bytes.

This trace and the token-usage document beside it were written after the client workflow finished, so they include the client's own closing activity.
