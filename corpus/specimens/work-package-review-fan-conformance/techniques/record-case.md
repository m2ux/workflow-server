---
metadata:
  version: 1.3.1
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### pipeline_mode

The prism pipeline mode for this case.

### code_review_report

The code review report for this case.

### test_suite_review_report

The test suite review report for this case.

### structural_findings

Structural findings for this case.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: the pipeline mode, whether the code review report is present, whether the test suite review report is present, and how many structural findings are present. Where the pipeline mode is `full-prism`, structural findings are empty.

## Protocol

### 1. Record Outcome

- Append this case to `{case_outcomes}` from `{pipeline_mode}`, `{code_review_report}`, `{test_suite_review_report}`, and `{structural_findings}`
