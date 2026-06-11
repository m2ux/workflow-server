---
metadata:
  version: 1.0.0
---

## Capability

Load the design framework and define a clear problem statement with system understanding, impact, success criteria, and constraints.

## Inputs

### issue_details

Summary, description, and context from the linked issue, reviewed to ground the problem statement (inherited from the [classify-problem](./TECHNIQUE.md) group root, declared here as the binding contract).

### problem_context

*(optional)* Additional context about the problem from the user or prior activities (inherited from the [classify-problem](./TECHNIQUE.md) group root).

## Output

### problem_statement

A clear problem definition with system understanding, impact assessment, success criteria, and constraints — understandable without prior context (a field of the [design_philosophy_doc](./TECHNIQUE.md) recorded later by [document](./document.md)).

## Protocol

### 1. Load Framework

- Use attached [design-framework](../../resources/design-framework.md) for full guidance
- Review `{issue_details}` and `{problem_context}`

### 2. Define Problem

- Create clear problem statement with system understanding
- Document impact assessment
- Define success criteria and constraints
- Ensure problem is understandable without prior context
- If the problem statement remains too vague, ask the user for more context to clarify system understanding, impact, or success criteria
