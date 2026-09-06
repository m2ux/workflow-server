---
metadata:
  version: 2.0.0
---

## Capability

Stakeholder discussion transcript recorded as the elicitation baseline, with the limitation noted where none was supplied.

## Inputs

### stakeholder_transcript

*(optional)* The transcript or summary of the discussion held with stakeholders before elicitation. Empty where the discussion did not happen.

## Outputs

### stakeholder_baseline

The stakeholder discussion as elicitation reads it — the recorded transcript, or the noted limitation that agent-led elicitation proceeds without one.

## Protocol

### 1. Record the Baseline

- Set `{stakeholder_baseline}` from `{stakeholder_transcript}`
  > Where `{stakeholder_transcript}` is empty, `{stakeholder_baseline}` carries the limitation that elicitation proceeds on agent-led questions alone, without stakeholder input behind them.
