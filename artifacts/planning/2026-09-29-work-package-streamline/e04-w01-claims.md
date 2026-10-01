# E04 W01 — claim table

Branch `workflow/e04-w01-task-contract`. Targets `i10/workflows`.

| # | Claim | Case | Evidence | Result |
|---|---|---|---|---|
| 1 | Each plan task carries a Contract with Signatures, Behaviours, Error cases and Acceptance | definition | `wp-plan.md` template + Contract rule | held |
| 2 | Plan-prepare's `plan` technique writes each task's Contract | definition | `plan-prepare/plan.md` protocol step 4 | held |
| 3 | Task contracts home in the work-package plan | definition | `canonical-home-map.md` | held |
| 4 | Implement reads the task Contract as the public specification | definition | `implement-task.md` protocol step 1 | held |
| 5 | Specimen complete case: Contract check holds | `work-package-task-contract-conformance` | walk U4YJKF | held |
| 6 | Specimen missing-field case: check fails naming Error cases | `work-package-task-contract-conformance` | walk U4YJKF | held |
| 7 | No activity YAML in work-package changed; AC8 has no activity surface | definition | diff | held |

## Notes

- AC1 instrument is the contract-first specimen walk (claims 5–6).
- AC8: W01 changes resources and techniques only.

## Run record

- MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-i10-activity-loop` · corpus pin `3b619419-dirty`
- Specimen `U4YJKF`, planning folder `…/2026-10-01-work-package-task-contract-conformance`
- Case report: `work-package-task-contract-cases.md`
