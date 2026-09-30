---
metadata:
  version: 1.0.0
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

### base_remote

The remote the change's branch was cut from.

### default_branch

The branch on that remote the change is measured against.

### prism_value_assessment

The recommendation on the full prism pipeline.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: whether it was a review run, the change measured and the base it was measured against, the recommendation, and the mode settled.

## Protocol

### 1. Record Outcome

- Append one entry to `{case_outcomes}`: `{is_review_mode}`, the `{changed_files}` measured at `{head_sha}` against `{base_remote}/{default_branch}`, the `{prism_value_assessment}`, and `{pipeline_mode}`
  > A review run's entry records the change, the base and the recommendation as absent.
