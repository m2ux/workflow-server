---
metadata:
  version: 1.0.0
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### pipeline_mode

The prism mode the structural branch took.

### code_review_report

The code review report hoisted at the join.

### test_suite_review_report

The test suite review report hoisted at the join.

### structural_findings

The structural findings the join holds after the fan.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: the pipeline mode, whether each bare report was present, and whether structural findings arrived from the inline branch.

## Protocol

### 1. Record Outcome

- Append one entry to `{case_outcomes}`: `{pipeline_mode}`, whether `{code_review_report}` is present, whether `{test_suite_review_report}` is present, and the length of `{structural_findings}`
  > On the full-prism case, structural findings are empty at this join — the production join runs the full pipeline instead.
