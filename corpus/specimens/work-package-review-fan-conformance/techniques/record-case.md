---
metadata:
  version: 1.1.0
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### pipeline_mode

The prism mode the structural branch took.

### code_review_report

The code review report for this case.

### test_suite_review_report

The test suite review report for this case.

### structural_findings

Structural findings for this case. Empty when `{pipeline_mode}` is `full-prism`.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: the pipeline mode, whether each report was present, and whether structural findings are present.

## Protocol

### 1. Record Outcome

- Append one entry to `{case_outcomes}`: `{pipeline_mode}`, whether `{code_review_report}` is present, whether `{test_suite_review_report}` is present, and the length of `{structural_findings}`
  > Where `{pipeline_mode}` is `full-prism`, `{structural_findings}` is empty.
