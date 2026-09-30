---
metadata:
  version: 2.1.0
---

## Capability

The baseline elicitation builds its questions on — the stakeholder discussion where one was held, and the recorded limitation where none was.

## Inputs

### stakeholder_discussion_held

Whether a stakeholder discussion took place before elicitation.

### stakeholder_discussion

*(optional)* Text the user typed carrying the stakeholder discussion transcript or its summary. Unset where no discussion was held.

## Outputs

### stakeholder_baseline

The stakeholder discussion as elicitation reads it — the recorded transcript, or the noted limitation that agent-led elicitation proceeds without one.

## Protocol

### 1. Record the Baseline

- Set `{stakeholder_baseline}` from `{stakeholder_discussion}` when `{stakeholder_discussion_held}` is true
  > Where `{stakeholder_discussion_held}` is false, `{stakeholder_baseline}` carries the limitation that elicitation proceeds on agent-led questions alone, without stakeholder input behind them.
