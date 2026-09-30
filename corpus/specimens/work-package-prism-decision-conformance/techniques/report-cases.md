---
metadata:
  version: 1.0.0
---

## Capability

State what the prism decision settled in each case.

## Inputs

### case_outcomes

What the decision settled in each case: its id, whether a gate was raised and the recommendation it carried, and whether the case takes the full pipeline.

## Outputs

### prism_decision_case_report

One row per case: the bindings it took, whether the gate was raised, the recommendation shown, and the pass the decision settled.

#### artifact

`work-package-prism-decision-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from `{case_outcomes}`, one row per case, per [Template](/conformance/resources/case-report.md#template), with the planning folder in the line a graph name takes.
   > The review row names the absent gate as the decision's own mark for a run no user attends, rather than as a gate the walk failed to reach.

### 2. Write the Report

- Write `{prism_decision_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
