# PR 2 — claim table

Branch `workflow/prism-gate`. Specimen `work-package-prism-decision-conformance`.

Run record: MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-lean-templates` · engine pin `a59870c7-dirty` (untracked `node_modules` link only). First walk: corpus `505823e8`, MVW `E74EEM`, specimen `CGJGYT`. Walk after the first audit's fixes: corpus `8a7ddfb1`, MVW `PZ3EMC`, specimen `DNB47I` (planning folder `…/2026-09-30-work-package-prism-decision-conformance-2`). Walk after the canon audit's fixes: corpus `ba5d0496`, MVW `QFFTMU`, specimen `4JSFWH` (planning folder `…/2026-09-30-work-package-prism-decision-conformance-3`).

| # | Claim | Case | Result |
|---|---|---|---|
| 1 | A complex implementation run measures the change, assesses it, and raises a hard gate whose message carries the recommendation | implementation | held — name-status ran on the component's tree against `main`, the assessment rendered verbatim with what the full pipeline adds, no default and no auto-advance |
| 2 | Choosing the inline pass sets `pipeline_mode` to `single` | implementation | held |
| 3 | A complex review run raises no gate and presets `full-prism` | review | held — neither the measurement nor the assessment was delivered, the gate was dismissed with no variable set |
| 4 | Post-implementation review runs the inline pass or the pipeline on `pipeline_mode`, and passes prism its own `target`, `target_description` and `pipeline_mode` | definition, walk snapshot | held — the snapshot records `name-prism-target` |
| 5 | A preset `pipeline_mode` sets every unit's mode in the prism plan | definition | held on the definition; the specimen does not walk the prism child |
| 6 | remediate-vuln routes through the decision | guards | held |
| 7 | Guards stay at the base's result | `check-all` against `4662d88d` | held — 57/57 |
| 8 | The review case reports no measurement | review | held — the report row carries no change and no recommendation |

## Found by the walk and the audits

- In the specimen's take-case, the implementation step raised the case index the review step's gate reads, so one pass could take both cases. The review step now comes first; the re-walk took one case per pass.
- The assessment first read `changed_files` and `base_branch`, which nothing produces on the implementation path at that point. The activity now measures the change itself.
- The prism plan set its own mode over a caller's preset. A preset now binds every unit.
- The launch relayed names prism does not declare. It now relays `target` and `target_description`.
- The assessment's output promised what the full pipeline adds, and no step produced it. Its weighing step now does.
- The decision had no Progress row. The README seed carries one, with a row-ownership entry.
- The specimen report followed a guide shaped for a positive and negative pair. It has a guide of its own.
