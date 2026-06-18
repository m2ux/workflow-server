# Evaluation Workflow — Activities

> Part of the [Evaluation Workflow](../README.md)

## Activities (7)

A pipeline that classifies a target, plans dimension-to-lens mappings, runs prism per dimension group, consolidates a report, and optionally resolves and applies mitigations. Several activities gate on a user checkpoint; the final two run only when the user opts into resolution. The authoritative definition of each activity — steps, checkpoints, transitions, and outcomes — lives in its TOON.

| # | ID | Name | Role |
|---|-----|------|------|
| 00 | [`scope-definition`](00-scope-definition.toon) | Define Evaluation Scope | Collect inputs, classify the target, and derive dimensions; user confirms scope |
| 01 | [`dimension-planning`](01-dimension-planning.toon) | Plan Dimension Analysis | Survey the target, map dimensions to lenses, and group for execution; user confirms the plan; writes `evaluation-plan.md` |
| 02 | [`execute-analysis`](02-execute-analysis.toon) | Execute Prism Analyses | Fan out a prism run per execution group and collect results |
| 03 | [`consolidate-report`](03-consolidate-report.toon) | Consolidate Evaluation Report | Extract findings, synthesise cross-dimensional patterns, and write `EVALUATION-REPORT.md` |
| 04 | [`deliver-results`](04-deliver-results.toon) | Deliver Evaluation Results | Present results and offer the optional resolution dialogue |
| 05 | [`resolution-dialogue`](05-resolution-dialogue.toon) | Resolution Dialogue | Tier-classify findings and propose mitigations one at a time; writes `MITIGATION-PLAN.md` |
| 06 | [`apply-mitigations`](06-apply-mitigations.toon) | Apply Accepted Mitigations | Apply accepted mitigations to the target after a final user confirmation |

Steps bind their domain technique via `step.technique`; the cross-cutting `variable-binding` strategy technique is declared once at the workflow level and inherited by every activity. The bound domain technique per activity is in the [workflow Techniques table](../README.md#techniques).

## Transition Chain

```
scope-definition ──[scope_confirmed]──→ dimension-planning ──[dimensions_confirmed]──→ execute-analysis ──→ consolidate-report ──→ deliver-results
                                                                                                                                       │
                                                                                          [resolution_requested] ──→ resolution-dialogue ──→ apply-mitigations
                                                                                                                                       └──→ __terminal__
```

`deliver-results` ends the workflow unless the user opts into the resolution dialogue. The `execute-analysis` activity fans out the `prism` workflow once per execution group.
