# E03 W02 — claim table

Branch `workflow/e03-w02-discovery-fan`. PR [#1063](https://github.com/m2ux/workflow-server/pull/1063).

| # | Claim | Case | Evidence | Result |
|---|---|---|---|---|
| 1 | `research-needed` and `no-research-needed` fan `research` with `implementation-analysis` | definition | `loadWorkflow` | held |
| 2 | Both branches converge on `plan-prepare` | definition | `loadWorkflow` | held |
| 3 | Research declares no checkpoints | definition | `04-research.yaml` | held |
| 4 | Research no-ops when `needs_research == false` | definition | skip action | held |
| 5 | Plan-prepare raises research-convergence and context-scope gates | definition | `06-plan-prepare.yaml` | held |
| 6 | Branches surface assumptions; join ingests once | definition | `surface-assumptions` / `ingest-assumption-surfaces` | held |
| 7 | Specimen loads with borrowed branch activities | specimen | `loadWorkflow` | held |
| 8 | Sidecar specimen walks the fan under both needs_research values | `work-package-discovery-fan-conformance` | walk MBCLAR | held — fan opened twice; ingest wrote the log; research no-op on case 2 |

## Notes

- Skip-optional still reaches plan-prepare without fan containers; hoist steps are `when`-gated. Unreachable-read on those container reads is the skip path.

## Run record

- MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-i10-activity-loop` · corpus pin `f8758543`
- Specimen `MBCLAR`, planning folder `…/2026-10-01-work-package-discovery-fan-conformance`
- Case report: `04-work-package-discovery-fan-cases.md`
