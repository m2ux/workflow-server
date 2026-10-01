# E05 — validation ledger

Subject tips: `i10/main` @ `3a0ec0fb`, `i10/workflows` @ `fc5cf13a`.

Criterion: every initiative AC1–AC14 passes its named instrument on those tips (I10 AC15).

| AC | Instrument | Command / walk | Result |
|---|---|---|---|
| AC1 | work-package snapshot walk — artifact list | `vitest run tests/e2e/snapshot.test.ts` (WORKFLOWS_DIR=`i10/workflows`) | pass — 23/23 on engine `3a0ec0fb`, corpus `fc5cf13a` |
| AC2 | canon audit of work-package report guides | workflow-canon Audit on guide surfaces | pass — [e05-ac2-guides.md](e05-ac2-guides.md); five guides, no open finding, on `fc5cf13a` |
| AC3 | prism-decision specimen — implementation case | specimen `work-package-prism-decision-conformance` | pass — walk `CUAFWP`; gate showed the empty-change assessment; measure-again returned to the decision; the second answer set `pipeline_mode` to `single` |
| AC4 | prism-decision specimen — review case | specimen `work-package-prism-decision-conformance` | pass — walk `CUAFWP`; gate dismissed with no variable set; review step preset `full-prism` |
| AC5 | work-package snapshot walk — executed steps | same snapshot matrix as AC1 | pass — same 23/23 run |
| AC6 | repeated-run guard | `check-repeated-runs` against corpus | pass — `repeated-runs: OK` (25 classified, 0 untriaged); no live assumption-run entry |
| AC7 | routines guard | `check-routines` against corpus | pass — `routines: OK — every routine's signature matches its body` |
| AC8 | work-package snapshot walk — review fan | same snapshot matrix as AC1 | pass — same 23/23 run |
| AC9 | work-package snapshot walk — discovery fan | same snapshot matrix as AC1 | pass — same 23/23 run |
| AC10 | contract-first specimen — tests from plan | specimen `work-package-task-contract-conformance` / contract-tests fan | pass — `FQLYRH` complete holds, missing field is Error cases; fan `5TMF3H` hoists a red base suite |
| AC11 | contract-first specimen — join runs tests | specimen `work-package-contract-join-conformance` | pass — `JPY7HO` pass case merges `tests/contract/t1.test.ts`, runs green, exit `done` |
| AC12 | contract-first specimen — failing test returns | specimen `work-package-contract-join-conformance` | pass — `JPY7HO` rework takes `needs-rework`; dispute takes `needs-contract-tests` |
| AC13 | epic audit records re-confirmed | re-read / re-run each epic's audit rounds on tip delta | pass — [e05-ac13-audits.md](e05-ac13-audits.md); work-package bytes unchanged since `38a0bae4` |
| AC14 | epic claim tables / sidecar specimens | re-run each epic's named specimen walks | |

## Notes

- Fill Result with `pass` or `fail` and a one-line cite (run URL, walk id, or guard OK line).
- A fail blocks merge of `#1096` and `#1097`.
- Sidecar for the walks that have run: image `workflow-server:exp-i10-e05`, engine pin `3a0ec0fb`, corpus pin `fc5cf13a`. MVW `RBSRK7` completed `dispatch` → `__terminal__` before the prism specimen. Prism report: `2026-10-01-work-package-prism-decision-conformance-2/work-package-prism-decision-cases.md` on the exp-projects clone.
