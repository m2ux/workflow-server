# E05 — validation ledger

Subject tips: `i10/main` @ _TBD_, `i10/workflows` @ _TBD_.

Criterion: every initiative AC1–AC14 passes its named instrument on those tips (I10 AC15).

| AC | Instrument | Command / walk | Result |
|---|---|---|---|
| AC1 | work-package snapshot walk — artifact list | `vitest run tests/e2e/snapshot.test.ts` (WORKFLOWS_DIR=`i10/workflows`) | |
| AC2 | canon audit of work-package report guides | workflow-canon Audit on guide surfaces | |
| AC3 | prism-decision specimen — implementation case | specimen `work-package-prism-decision-conformance` | |
| AC4 | prism-decision specimen — review case | specimen `work-package-prism-decision-conformance` | |
| AC5 | work-package snapshot walk — executed steps | same snapshot matrix as AC1 | |
| AC6 | repeated-run guard | `check-repeated-runs` against corpus | |
| AC7 | routines guard | `check-routines` against corpus | |
| AC8 | work-package snapshot walk — review fan | same snapshot matrix as AC1 | |
| AC9 | work-package snapshot walk — discovery fan | same snapshot matrix as AC1 | |
| AC10 | contract-first specimen — tests from plan | specimen `work-package-task-contract-conformance` / contract-tests fan | |
| AC11 | contract-first specimen — join runs tests | specimen `work-package-contract-join-conformance` | |
| AC12 | contract-first specimen — failing test returns | specimen `work-package-contract-join-conformance` | |
| AC13 | epic audit records re-confirmed | re-read / re-run each epic's audit rounds on tip delta | |
| AC14 | epic claim tables / sidecar specimens | re-run each epic's named specimen walks | |

## Notes

- Fill Result with `pass` or `fail` and a one-line cite (run URL, walk id, or guard OK line).
- A fail blocks merge of `#1096` and `#1097`.
