---
metadata:
  version: 1.1.0
---

## Capability

Map the assessed complexity to a workflow path and set the elicitation/research/skip gating variables accordingly.

## Inputs

### problem_complexity

The assessed complexity (simple, moderate, or complex), mapped to a workflow path.

## Outputs

### needs_elicitation

Boolean gate — whether requirements elicitation is needed on the chosen path.

### needs_research

Boolean gate — whether research is needed on the chosen path.

### skip_optional_activities

Boolean gate — whether to skip optional discovery work.

### needs_comprehension

Always `true` — codebase comprehension is mandatory before planning, on every path.

### path_rationale

The documented rationale for the selected workflow path (full, elicitation-only, research-only, or skip-optional).

## Protocol

### 1. Determine Path

- Map complexity to workflow path (full, elicitation-only, research-only, or skip optional discovery work): simple, clearly-scoped problems take the lighter paths; moderate and complex problems take the full path
- The complexity also scopes how much of the [design framework](../../resources/design-framework.md#design-framework-trizics-approach) plan-prepare later applies — simple: problem definition, conventional solutions, synthesis; moderate: add problem classification; complex: include inventive solutions. Do not over-engineer the process for the problem size.
- Document path rationale
- Set needs-elicitation, needs-research, skip-optional-activities accordingly
- Set needs-comprehension to true — codebase comprehension is mandatory before planning, on every path
- For simple changes, lightweight application is acceptable — not every bug fix needs full elicitation
