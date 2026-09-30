---
metadata:
  version: 1.0.0
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### is_review_mode

Whether the case is a review run.

### assumptions_log

The assumptions log as the case left it.

### has_deferred_assumptions

Whether the case deferred an assumption to stakeholders.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: whether it was a review run, the steps the review ran after collecting, whether the batch gate was raised and with what, the outcome each assumption carries in the log, and whether any was deferred.

## Protocol

### 1. Record Outcome

- Append one entry to `{case_outcomes}`: `{is_review_mode}`, the steps the review ran after collecting, in order, whether the batch gate was raised and the presentation its message carried, the Outcome cell of each row the case added to `{assumptions_log}`, and `{has_deferred_assumptions}`
  > A review run's entry records the gate and the presentation as absent.
