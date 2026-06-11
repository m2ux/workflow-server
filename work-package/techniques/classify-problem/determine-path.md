---
metadata:
  version: 1.0.0
---

## Capability

Map the assessed complexity to a workflow path and set the elicitation/research/skip gating variables accordingly.

## Inputs

### complexity

The assessed complexity (simple, moderate, or complex), mapped to a workflow path.

## Outputs

### needs_elicitation

Boolean gate — whether requirements elicitation is needed on the chosen path.

### needs_research

Boolean gate — whether research is needed on the chosen path.

### skip_optional_activities

Boolean gate — whether to skip optional discovery work.

### path_rationale

The documented rationale for the selected workflow path (full, elicitation-only, research-only, or skip-optional).

## Protocol

### 1. Determine Path

- Map complexity to workflow path (full, elicitation-only, research-only, or skip optional discovery work)
- Document path rationale
- Set needs-elicitation, needs-research, skip-optional-activities accordingly
- For simple changes, lightweight application is acceptable — not every bug fix needs full elicitation
