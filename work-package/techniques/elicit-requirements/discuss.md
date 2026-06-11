---
metadata:
  version: 1.0.0
---

## Capability

Prompt the user for the stakeholder discussion transcript before agent-led elicitation begins, offering a skip path with a noted limitation.

## Inputs

### stakeholder_transcript

*(optional)* Transcript or summary from the user's discussion with key stakeholders, prompted for here before elicitation; a skip path with a noted limitation is offered when none is provided (inherited from the [elicit-requirements](./TECHNIQUE.md) group root, declared here as the binding contract).

## Outputs

### stakeholder_transcript

The transcript or summary captured from the user (inherited from the [elicit-requirements](./TECHNIQUE.md) group root), or absent when the user skips — in which case the limitation is noted and agent-led elicitation proceeds.

### has_stakeholder_input

Boolean gate — true iff a transcript was provided, false when stakeholder discussion was skipped.

## Protocol

### 1. Prompt Transcript

- Prompt user for the `{stakeholder_transcript}` before elicitation  
  > Stakeholder input comes first: the user should discuss the initiative with key stakeholders before agent elicitation begins.
- Offer skip option with note about limitation if no `{stakeholder_transcript}` is provided
- If the user skips stakeholder discussion entirely, note the limitation and proceed with agent-led elicitation
