---
metadata:
  version: 3.1.0
---

## Capability

Human-facing assumption lifecycle — collection, residual interview/batch after analyse-challenge converges, and log of decisions.

## Inputs

### assumption_source

The work the assumptions are drawn from — the design decision, the plan, the analysis, or the change under construction.

### assumption_categories

The categories an assumption is classified into.

### assumptions_log

*(optional)* The existing assumptions [log](../../resources/assumptions-review.md#assumptions-log-template), if one exists

## Outputs

### assumptions_log

Assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with review outcomes — grows as the work progresses



## Rules

### elevate-implicit

Make implicit decisions explicit — assumptions should be elevated for validation

### assumptions-log-is-the-record

Every assumption's category, agent position and resolution status lives in the assumptions log, so a later reader settles an outcome from the log rather than from the transcript that produced it.
