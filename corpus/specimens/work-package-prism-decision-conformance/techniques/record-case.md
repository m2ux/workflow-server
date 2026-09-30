---
metadata:
  version: 1.0.1
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### is_review_mode

Whether the case is a review run.

### pipeline_mode

The prism mode settled for the case.

### changed_files

The paths the change touches.

### head_sha

The commit the change stands at.

### prism_value_assessment

The recommendation on the full prism pipeline, where a gate carried one.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: whether it was a review run, the change measured, the recommendation the gate carried, and the mode settled.

## Protocol

### 1. Record the Outcome

- Append one entry to `{case_outcomes}`: `{is_review_mode}`, the `{changed_files}` measured at `{head_sha}`, the `{prism_value_assessment}` the gate carried, and `{pipeline_mode}`
  > Every fixture case is complex, so the gate is raised exactly where `{is_review_mode}` is false. A review run records the change and the recommendation as absent, per `decision-case-report.a-case-reports-only-what-it-measured`.
