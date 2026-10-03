---
metadata:
  version: 1.0.0
---

## Capability

State what the review fan landed in each case.

## Inputs

### case_outcomes

One outcome per case walked.

## Outputs

### review_fan_case_report

What the fan landed in each case, shaped by [Template](../resources/review-fan-case-report.md#template).

#### artifact

`work-package-review-fan-cases.md`

#### audience

`human`

## Protocol

### 1. Write Report

- Fill one row per entry of `{case_outcomes}` per [Template](../resources/review-fan-case-report.md#template) and its [Rules](../resources/review-fan-case-report.md#rules).
- Write `{review_fan_case_report}` to `{planning_folder_path}`.
