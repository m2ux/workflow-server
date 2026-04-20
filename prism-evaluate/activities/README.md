# Evaluation Workflow — Activities

> Part of the [Evaluation Workflow](../README.md)

## Activities (5)

Linear activity sequence with two blocking checkpoints.

| # | ID | Name | Skill | Checkpoint | Artifacts |
|---|-----|------|-------|------------|-----------|
| 00 | `scope-definition` | Define Evaluation Scope | plan-evaluation | confirm-scope | — |
| 01 | `dimension-planning` | Plan Dimension Analysis | plan-evaluation | confirm-plan | evaluation-plan.md |
| 02 | `execute-analysis` | Execute Prism Analyses | plan-evaluation | — | (prism artifacts via trigger) |
| 03 | `consolidate-report` | Consolidate Evaluation Report | compose-evaluation-report | — | EVALUATION-REPORT.md |
| 04 | `deliver-results` | Deliver Evaluation Results | compose-evaluation-report | — | — |

## Transition Chain

```
scope-definition ──[scope_confirmed]──→ dimension-planning ──[dimensions_confirmed]──→ execute-analysis ──→ consolidate-report ──→ deliver-results
```

Transitions from scope-definition and dimension-planning are conditioned on their respective checkpoint variables. All other transitions are unconditional defaults.

## Checkpoints

| Checkpoint | Activity | Options | Effect |
|------------|----------|---------|--------|
| confirm-scope | scope-definition | Proceed / Adjust scope | Sets `scope_confirmed = true` or loops back |
| confirm-plan | dimension-planning | Proceed / Adjust plan | Sets `dimensions_confirmed = true` or loops back |

## Triggers

The `execute-analysis` activity triggers the `prism` workflow via a forEach loop over `execution_groups`. Each group passes: `target`, `output_path`, `pipeline_mode`, `selected_lenses`, `analysis_focus`.
