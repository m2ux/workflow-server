---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 13
  legacy_id: 13
---

# Review Assumptions

## Capability

Own the human-facing assumption lifecycle — collect and classify the assumptions made during an activity, interview the user on the open ones, and record their decisions back into the assumptions log. Operations inherit the shared inputs, outputs, and rules below.

## Inputs

### activity_context

Which activity is generating assumptions

### assumption_categories

The per-activity list of categories used to classify assumptions during collection (supplied via `technique_args` from the consuming activity). Collection classifies each assumption into one of these categories.

### existing_assumptions_log

*(optional)* The existing assumptions [log](../../resources/assumptions-review.md#assumptions-log-template), if one exists

## Outputs

### updated_assumptions_log

Assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with review outcomes — grows across activities

#### assumptions_log_artifact

`assumptions-log.md`

## Rules

### elevate-implicit

Make implicit decisions explicit — assumptions should be elevated for validation
