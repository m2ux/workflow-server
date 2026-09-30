---
metadata:
  version: 1.0.0
---

## Capability

State what the prism decision settled in each case.

## Inputs

### case_outcomes

One outcome per case walked.

## Outputs

### prism_decision_case_report

What the decision settled in each case, shaped by [Template](../resources/decision-case-report.md#template).

#### artifact

`work-package-prism-decision-cases.md`

#### audience

`human`

## Protocol

### 1. Write Report

- Fill one row per entry of `{case_outcomes}` per [Template](../resources/decision-case-report.md#template) and its [Rules](../resources/decision-case-report.md#rules).
- Write `{prism_decision_case_report}` to `{planning_folder_path}`.
