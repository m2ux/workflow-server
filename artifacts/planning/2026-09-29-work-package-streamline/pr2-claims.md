# PR 2 — claim table

Branch `workflow/prism-gate`. Specimen `work-package-prism-decision-conformance`.

Run record: MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-lean-templates` · engine pin `a59870c7-dirty` (untracked `node_modules` link only). First walk: corpus `505823e8`, MVW `E74EEM`, specimen `CGJGYT`. Walk after the audit fixes: corpus `8a7ddfb1`, MVW `PZ3EMC`, specimen `DNB47I` (planning folder `…/2026-09-30-work-package-prism-decision-conformance-2`).

| # | Claim | Case | Result |
|---|---|---|---|
| 1 | A complex implementation run measures the change, assesses it, and raises a hard gate whose message carries the recommendation | implementation | held — name-status ran against `main`, the assessment rendered verbatim, no default and no auto-advance |
| 2 | Choosing the inline pass sets `pipeline_mode` to `single` | implementation | held |
| 3 | A complex review run raises no gate and presets `full-prism` | review | held — neither the measurement nor the assessment was delivered, the gate was dismissed with no variable set |
| 4 | Post-implementation review runs the inline pass or the pipeline on `pipeline_mode`, and passes it to the prism child | definition, walk snapshot | held — the trigger's `passContext` carries `pipeline_mode` |
| 5 | remediate-vuln routes through the decision | guards | held |
| 6 | Guards stay at the base's result | `check-all` against `4662d88d` | held — 57/57 |

## Found by the walk and the audit

- In the specimen's take-case, the implementation step raised the case index the review step's gate reads, so one pass could take both cases. The review step now comes first; the re-walk took one case per pass.
- The assessment first read `changed_files` and `base_branch`, which nothing produces on the implementation path at that point. The activity now measures the change itself.
- The parent's choice did not reach the prism child, which could settle its own mode. The decision now sets prism's `pipeline_mode`, and the launch passes it.
- Prism's own plan step may still re-derive the mode after a preset; that holds for every caller that presets one and belongs to prism.
