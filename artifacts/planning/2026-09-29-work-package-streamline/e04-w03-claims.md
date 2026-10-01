# E04 W03 — claim table

Branch `workflow/e04-w03-join-runs-tests`. Targets `i10/workflows`.

| # | Claim | Case | Evidence | Result |
|---|---|---|---|---|
| 1 | Join merges contract-test files into the implement worktree | definition | `merge-contract-tests.md` | held |
| 2 | Join runs contract tests against the implementation | definition | `run-contract-tests.md` + join steps | held |
| 3 | A failing suite returns to implement via `needs-rework` | definition | join exit + graph | held |
| 4 | A disputed test reaches the user as `contract-ambiguity` | definition | join checkpoint | held |
| 5 | Ambiguity can revise tests (`needs-contract-tests`) or accept | definition | ambiguity options | held |
| 6 | Specimen pass / rework / dispute cases | `work-package-contract-join-conformance` | walk 2COA4X | held |

## Notes

- AC4–AC6 instruments are the contract-join specimen walk (claim 6).

## Run record

- MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-i10-activity-loop` · corpus pin `a5f92571`
- Specimen `2COA4X`, planning folder `…/2026-10-01-work-package-contract-join-conformance`
- Case report: `work-package-contract-join-cases.md` — pass→done; rework→needs-rework; dispute→needs-contract-tests
