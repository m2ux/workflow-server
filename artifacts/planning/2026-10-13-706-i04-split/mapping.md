# Mapping

Every epic, criterion, pull request and branch, with the id it held under the single technical-debt initiative and the id it holds under its area's initiative.

## Initiatives

| Initiative | Issue | Area | Priority | Board status |
| --- | --- | --- | --- | --- |
| I15 Server Debt | 1378 | The engine, its schema, its session store | `priority: 2` | In Progress |
| I13 Corpus Debt | 1379 | The definitions the engine walks | `priority: 1` | Ready |
| I14 Instrument Debt | 1380 | Guards, tests, walks, roster, continuous integration | none | Backlog |

## Epics

| Source | New | Issue | State | Area read |
| --- | --- | --- | --- | --- |
| I04:E08 Safe Ground | I15:E00 | 528 | closed | Session dispatch and the cost record the server writes |
| I04:E03 Worker Continuation | I15:E01 | 710 | open | The advance path and the batch reading it continues from |
| I04:E05 Inline Gates | I15:E02 | 750 | open | The activity schema's gate forms |
| I04:E11 Session Naming | I15:E03 | 1199 | open | The session store's folder naming |
| I04:E06 Declared Shapes | I13:E00 | 948 | open | Technique declarations and contract values |
| I04:E09 Unspent Inputs | I13:E01 | 1138 | open | Steps binding inputs nothing holds |
| I04:E07 Red Guards | I13:E02 | 1116 | open | Corpus reads and checkpoints two guards report on |
| I04:E13 Unproduced Reads | I13:E03 | 1248 | open | Corpus values with no producer |
| I04:E04 Coverage Walk | I14:E00 | 711 | closed | The coverage workflow's triggers |
| I04:E10 Honest Checks | I14:E01 | 1160 | closed | What a guard and a walk model measure |
| I04:E12 Sidecar Contention | I14:E02 | 1242 | closed | The instance a walk is served by |
| I04:E00 Wrong Records | I14:E03 | 707 | open | Walk assertions over the delivered contract |
| I04:E01 Missing Checks | I14:E04 | 708 | open | New guards and the rule-hygiene entry |
| I04:E14 Merge Gate | I14:E05 | 1159 | open | Branch protection and job selection |
| I04:E15 Harness Parity | I14:E06 | 1301 | open | The command policy each harness enforces |

## Criteria

| Source | New |
| --- | --- |
| I04 AC16, AC17 | I15 AC1, AC2 |
| I04 AC5, AC6, AC7 | I15 AC3, AC4, AC5 |
| I04 AC10, AC11 | I15 AC6, AC7 |
| I04 AC23, AC24 | I15 AC8, AC9 |
| I04 AC12, AC13 | I13 AC1, AC2 |
| I04 AC18, AC19, AC21 | I13 AC3, AC4, AC5 |
| I04 AC14, AC15 | I13 AC6, AC7 |
| I04 AC27 | I13 AC8 |
| I04 AC8, AC9 | I14 AC1, AC2 |
| I04 AC20, AC22 | I14 AC3, AC4 |
| I04 AC25, AC26 | I14 AC5, AC6 |
| I04 AC1, AC2 | I14 AC7, AC8 |
| I04 AC3, AC4 | I14 AC9, AC10 |
| I04 AC28, AC29 | I14 AC11, AC12 |
| I04 AC30 | I14 AC13 |

## Pull requests and epic bases

GitHub's branch rename retargets a pull request that *targets* the renamed branch and closes one whose *head* is renamed. An epic review pull request has its base as its head, so each of the ten was closed by the rename and reopened from the renamed base, carrying its title and body, with its epic relinked through `addCloseIssueReferences`.

| Review pull request | Epic base | New base | New review pull request | Epic |
| --- | --- | --- | --- | --- |
| 1306 | i04/e00/main | i14/e03/main | 1381 | 707 |
| 1307 | i04/e01/main | i14/e04/main | 1382 | 708 |
| 1313 | i04/e01/workflows | i14/e04/workflows | 1383 | 708 |
| 1308 | i04/e03/main | i15/e01/main | 1397 | 710 |
| 1310 | i04/e05/main | i15/e02/main | 1398 | 750 |
| 1314 | i04/e05/workflows | i15/e02/workflows | 1399 | 750 |
| 1311 | i04/e06/main | i13/e00/main | 1387 | 948 |
| 1315 | i04/e06/workflows | i13/e00/workflows | 1388 | 948 |
| 1312 | i04/e09/main | i13/e01/main | 1389 | 1138 |
| 1316 | i04/e09/workflows | i13/e01/workflows | 1390 | 1138 |

Pull request 1300 heads a task branch onto `workspace` and keeps both, retitled `[I14:E06]`.

Task branches under `i04/` are the history of merged work and keep the names they merged under. A base for a closed epic keeps its name for the same reason.

## Criteria carried unticked against a closed epic

I04:E12 is closed while AC25 and AC26 stand unticked, and its Work Breakdown row carries no delivery mark. The criteria are carried across in the state they are in, as I14 AC5 and AC6, and a sync of I14 settles them against the delivery.
