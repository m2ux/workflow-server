---
metadata:
  version: 1.0.0
---

## Capability

Judge whether `{synthesis}` (and `{gathered_results}`) leave material gaps against `{goal}`, and optionally emit follow-up `{work_units}`.

## Inputs

### goal

Original research goal.

### synthesis

Current synthesised answer.

### gathered_results

*(optional)* Underlying gathered items for gap detection.

### effort_cap

*(optional)* Maximum follow-up work units to emit.

## Outputs

### has_research_gaps

`true` when material gaps remain that a follow-up fan-out should address.

### work_units

Follow-up research units when `{has_research_gaps}` is true; empty array otherwise.

## Protocol

1. Compare `{synthesis}` (and `{gathered_results}` when present) to `{goal}`.
2. If gaps are material and within `{effort_cap}`, set `{has_research_gaps}` true and emit targeted `{work_units}` briefs.
3. Otherwise set `{has_research_gaps}` false and `{work_units}` to `[]`.
