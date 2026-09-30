---
metadata:
  version: 1.0.0
---

## Capability

State what the prism decision settled in each case.

## Inputs

### case_outcomes

What the decision settled in each case: whether it was a review run, the recommendation the gate carried, and the mode the decision settled.

## Outputs

### prism_decision_case_report

One row per case — its bindings, whether the gate was raised, the recommendation shown, and the mode settled — under a header naming the activity walked, followed by one line per case on what the walk evidenced.

#### artifact

`work-package-prism-decision-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill one row per entry of `{case_outcomes}` in the shape `{prism_decision_case_report}` declares, following the case report's [Rules](/conformance/resources/case-report.md#rules) for what a row may claim.
   > The review row names the absent gate as the decision's own mark for a run no user attends, rather than as a gate the walk failed to reach.

### 2. Write the Report

- Write `{prism_decision_case_report}` to `{planning_folder_path}`.
