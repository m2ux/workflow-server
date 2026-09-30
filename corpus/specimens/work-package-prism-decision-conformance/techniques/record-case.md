---
metadata:
  version: 1.0.0
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### is_review_mode

Whether the case just walked is a review run.

### pipeline_mode

The prism mode the decision settled for the case.

### changed_files

The paths the decision measured the change as touching.

### head_sha

The commit the change was measured at.

### prism_value_assessment

The recommendation the decision put to the user, where it raised a gate.

### case_outcomes

What the decision settled in each case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: whether it was a review run, the change measured, the recommendation the gate carried, and the mode the decision settled.

## Protocol

### 1. Record the Outcome

- Append one entry to `{case_outcomes}`: `{is_review_mode}`, the `{changed_files}` measured at `{head_sha}`, the `{prism_value_assessment}` the gate carried, and `{pipeline_mode}`
  > Every fixture case is complex, so the gate is raised exactly where `{is_review_mode}` is false; for a review run record the recommendation as absent rather than carrying over an earlier case's text.
