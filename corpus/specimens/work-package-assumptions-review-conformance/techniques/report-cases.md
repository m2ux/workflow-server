---
metadata:
  version: 1.0.0
---

## Capability

State what the assumptions review settled in each case.

## Inputs

### case_outcomes

One outcome per case walked.

### planning_folder_path

The planning folder the report is written into.

## Outputs

### assumptions_review_case_report

What the review settled in each case, shaped by [Template](../resources/assumptions-case-report.md#template).

#### artifact

`work-package-assumptions-review-cases.md`

#### audience

`human`

## Protocol

### 1. Write Report

- Fill one row per entry of `{case_outcomes}` per [Template](../resources/assumptions-case-report.md#template) and its [Rules](../resources/assumptions-case-report.md#rules).
- Write `{assumptions_review_case_report}` to `{planning_folder_path}`.
