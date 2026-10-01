# E03 W01 — claim table

Branch `workflow/e03-w01-review-fan`. PR targets `i10/workflows`.

Open question settled before authoring: L14 refuses `workflow-engine::handle-sub-workflow` on a fanned activity ([workflow-loader](https://github.com/m2ux/workflow-server/blob/878d741e0e3f960e592cc8dbaca8f3b80f290d62/src/loaders/workflow-loader.ts#L702-L710)). Full prism stays at the join.

| # | Claim | Case | Evidence | Result |
|---|---|---|---|---|
| 1 | `prism-decision.done` fans `code-review`, `structural-analysis` and `test-suite-review` | definition | `loadWorkflow` | held — destinations `["code-review","structural-analysis","test-suite-review"]` |
| 2 | Each branch converges on `post-impl-review` | definition | `loadWorkflow` | held |
| 3 | Branches declare no checkpoints | definition | activity YAML | held |
| 4 | Structural branch binds the inline pass when `pipeline_mode != 'full-prism'` and defers when full prism | definition | `18-structural-analysis.yaml` | held |
| 5 | Join runs `handle-sub-workflow` only when `pipeline_mode == 'full-prism'` | definition | `10-post-impl-review.yaml` | held |
| 6 | Join hoists fan containers into bare reports before classify | definition | `take-fan-reports` / `take-inline-structural` | held |
| 7 | Activity-variables guard raises no new finding on the changed activities | guard | `check-activity-variables` against the branch corpus | held — remaining rows are pre-existing unproduced-reads |
| 8 | Sidecar specimen walks each changed activity | specimen | pending | open |

## Notes

- AC1/AC2 instruments name the work-package snapshot walk; AC7 names a sidecar specimen. Claim 8 stays open until that specimen lands.
