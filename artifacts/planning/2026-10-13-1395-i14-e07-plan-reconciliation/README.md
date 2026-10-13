# I14:E07 Plan Reconciliation — October 2026

> Planning · Created 2026-10-13

## Executive Summary

Delivery of I14:E07 measured two of its criteria against subjects the epic does not hold. AC1 named a guard that lives only on `i14/e04/main`, and AC4 named a canon audit of definitions no task of this epic changes. Both left the epic, and the typecheck work went to the epic whose branch carries the guard. This record holds the reach each remaining criterion is held to and the readings that set it.

AC3 was then narrowed. As written it asked for a green verify on every integration branch, which three other initiatives own: `i08/main` and `i10/main` fail at the suite, which no job split reaches, and `i09/main` at the definitions-call-the-tools pairing. The epic grades the default branch and the branch the corpus lives on; the integration branches became an epic of their own.

## Decisions

| Decision | What was chosen | Why |
| --- | --- | --- |
| AC1 and W01 | Left the epic for I14:E04 W09 | `guards/check-role-barred-calls.ts` and its test file exist only on `i14/e04/main`, so the red check is that branch's and the correction lands with it. A copy elsewhere puts one guard on two branches and a conflict at merge. |
| AC4 and W04 | Removed | No task row's work reaches the branch the corpus lives on, so the corpus-audit criterion does not apply. |
| Criterion ids | Left with gaps at AC1 and AC4 | AC2 is ticked and merged pull request #1404's Test Plan names it. Renumbering would rewrite what a merged pull request says it delivered. |
| AC3 | Narrowed to the default branch and the corpus branch | The integration-branch half is three other initiatives' work, needing their owners. |
| Integration branches | A new epic under I14 | Three separate investigations, each landing on a branch this epic does not own. |
| The guard sweep's trigger | A row on this epic | AC3's corpus half is observable only from a hand dispatch until the sweep runs on what reaches that branch. |
| The delivery-cost gate | A row and a criterion on this epic | Same file and same defect class as AC5: a check deciding whether another check runs. |

## Rows That Could Share a Pull Request and Do Not

| Pair | Why they are separate |
| --- | --- |
| W04 and W05 | Both change continuous integration, and each delivers a criterion the other does not. The sweep's trigger is read from a run on the corpus branch; the cost gate's verdict is read from a pull request whose suite failed. One pull request would carry two unrelated observations, and a failure in either would hold the other back. |

## Artifacts

| Artifact | What it holds |
| --- | --- |
| — | This record holds its content in full. |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I14:E07 Red Trunk](https://github.com/m2ux/workflow-server/issues/1395) |
| Initiative | [I14 Instrument Debt](https://github.com/m2ux/workflow-server/issues/1380) |
| W01+W02 delivery record | [2026-10-13-1395-i14-e07-w01-guard-imports-that-resolve](../2026-10-13-1395-i14-e07-w01-guard-imports-that-resolve/README.md) |
| W03 delivery record | [2026-10-13-1395-i14-e07-w03-a-verify-step-that](../2026-10-13-1395-i14-e07-w03-a-verify-step-that/README.md) |
