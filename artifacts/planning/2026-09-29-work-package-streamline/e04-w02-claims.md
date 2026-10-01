# E04 W02 — claim table

Branch `workflow/e04-w02-contract-tests`. Targets `i10/workflows`.

| # | Claim | Case | Evidence | Result |
|---|---|---|---|---|
| 1 | `assumptions-approved` fans `contract-tests` with `implement` | definition | `workflow.yaml` graph | held |
| 2 | Both branches converge on `implementation-join` | definition | `workflow.yaml` graph | held |
| 3 | Contract-tests writes from the Contract alone | definition | `write-contract-tests.md` contract-alone rule | held |
| 4 | Contract-tests confirms failure against the base tree | definition | `verify-contract-tests-fail.md` | held |
| 5 | Join hoists contract-tests containers and validates red on base | definition | `21-implementation-join.yaml` | held |
| 6 | Specimen walks the fan into the join | `work-package-contract-tests-fan-conformance` | walk | pending |

## Notes

- AC2/AC3 instruments name the contract-first specimen walk; claim 6 holds the fan join path. Full write-and-fail walk of `20-contract-tests.yaml` remains for a follow-up cycle when the sidecar engine loads work-package routines.
