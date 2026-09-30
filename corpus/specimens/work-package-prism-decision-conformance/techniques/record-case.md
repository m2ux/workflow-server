---
metadata:
  version: 1.0.0
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### is_review_mode

Whether the case just walked is a review run.

### run_full_prism

Whether the decision sent the case to the full prism pipeline.

### prism_value_assessment

The recommendation the decision put to the user, where it raised a gate.

### case_outcomes

What the decision settled in each case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: whether it was a review run, whether a gate was raised and the recommendation it carried, and whether the case takes the full pipeline.

## Protocol

### 1. Record the Outcome

- Append one entry to `{case_outcomes}`: `{is_review_mode}`, whether the decision raised its gate, the `{prism_value_assessment}` that gate carried, and `{run_full_prism}`
  > A review run raises no gate; record the recommendation as absent for it rather than carrying over an earlier case's text.
