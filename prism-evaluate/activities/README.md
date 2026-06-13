# Evaluation Workflow — Activities

> Part of the [Evaluation Workflow](../README.md)

## Activities (7)

Pipeline sequence with five blocking checkpoints; the final two activities run only when the user opts into resolution.

| # | ID | Name | Technique | Checkpoint | Artifacts |
|---|-----|------|-------|------------|-----------|
| 00 | `scope-definition` | Define Evaluation Scope | plan-evaluation | confirm-scope | — |
| 01 | `dimension-planning` | Plan Dimension Analysis | plan-evaluation | confirm-plan | evaluation-plan.md |
| 02 | `execute-analysis` | Execute Prism Analyses | — | — | (prism artifacts via trigger) |
| 03 | `consolidate-report` | Consolidate Evaluation Report | compose-evaluation-report | — | EVALUATION-REPORT.md |
| 04 | `deliver-results` | Deliver Evaluation Results | compose-evaluation-report | resolution-offer | — |
| 05 | `resolution-dialogue` | Resolution Dialogue | resolve-findings | finding-decision | MITIGATION-PLAN.md |
| 06 | `apply-mitigations` | Apply Accepted Mitigations | resolve-findings | confirm-apply | (modified target) |

## Transition Chain

```
scope-definition ──[scope_confirmed]──→ dimension-planning ──[dimensions_confirmed]──→ execute-analysis ──→ consolidate-report ──→ deliver-results
                                                                                                                                       │
                                                                                          [resolution_requested] ──→ resolution-dialogue ──→ apply-mitigations
                                                                                                                                       └──→ __terminal__
```

Transitions from scope-definition and dimension-planning are conditioned on their respective checkpoint variables; `deliver-results` branches on `resolution_requested`. All other transitions are unconditional defaults.

## Checkpoints

| Checkpoint | Activity | Options | Effect |
|------------|----------|---------|--------|
| confirm-scope | scope-definition | Proceed / Adjust scope | Sets `scope_confirmed = true` or loops back |
| confirm-plan | dimension-planning | Proceed / Adjust plan | Sets `dimensions_confirmed = true` or loops back |
| resolution-offer | deliver-results | Proceed / Evaluation only / Address externally | Sets `resolution_requested` true or false |
| finding-decision | resolution-dialogue | Accept / Modify / Skip / Discuss | Records each finding's disposition |
| confirm-apply | apply-mitigations | Apply / Keep plan only | Gates whether changes are written to the target |

## Triggers

The `execute-analysis` activity triggers the `prism` workflow via a forEach loop over `execution_groups`. Each group passes: `target`, `target_type`, `output_path`, `pipeline_mode`, `selected_lenses`, `analysis_focus`.
