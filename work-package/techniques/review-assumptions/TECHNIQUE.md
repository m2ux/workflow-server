---
metadata:
  version: 3.1.0
---

## Capability

Human-facing assumption lifecycle — collection, residual interview/batch after analyse-challenge converges, and log of decisions.

## Inputs

### activity_context

The context in which assumptions are generated

### assumption_categories

The list of categories used to classify assumptions during collection (supplied via `step.technique.inputs`). Collection classifies each assumption into one of these categories.

### assumptions_log

*(optional)* The existing assumptions [log](../../resources/assumptions-review.md#assumptions-log-template), if one exists

## Outputs

### assumptions_log

Assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with review outcomes — grows as the work progresses

#### assumptions_log_artifact

`assumptions-log.md`


## Rules

### elevate-implicit

Make implicit decisions explicit — assumptions should be elevated for validation

### residual-interview-only

[interview](./interview.md) runs only when `{has_open_assumptions}` remains true after analyse-challenge (or a standalone reconcile when the construct is not bound). Empty residue skips user input.
