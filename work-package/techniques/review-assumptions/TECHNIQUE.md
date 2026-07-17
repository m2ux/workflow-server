---
metadata:
  version: 3.0.0
---

## Capability

Own the human-facing assumption lifecycle — collect and classify the assumptions made during the work, interview the user on the open ones, and record their decisions back into the assumptions log.

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
