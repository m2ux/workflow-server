---
metadata:
  version: 1.1.0
---

## Capability

Define a clear problem statement with system understanding, impact, success criteria, and constraints.

## Inputs

### issue_details

Summary, description, and context from the linked issue, reviewed to ground the problem statement.

### problem_context

*(optional)* Additional context about the problem from the user or prior context.

## Outputs

### problem_statement

A clear problem definition with system understanding, impact assessment, success criteria, and constraints — understandable without prior context.

## Protocol

### 1. Review Context

- Review `{issue_details}` and `{problem_context}`; the solution-space methodology (conventional-first, inventive principles) lives in the [design-framework](../../resources/design-framework.md#design-framework-trizics-approach) and is applied later at plan time — this operation defines the problem only

### 2. Define Problem

- Create the problem statement against the definition checklist — every box must hold:
  - **Problem Statement**: clear, specific, quantified — "The /users endpoint P95 latency exceeds 500ms under load >100 RPS", not "The API is slow"
  - **System Understanding**: the components, relationships, and context are known
  - **Impact Assessment**: severity, frequency, and business impact
  - **Success Criteria**: measurable outcomes that define "solved"
  - **Constraints**: time, resources, technical limitations
  - **Root Cause**: underlying cause vs. symptoms (if applicable)
- Ensure problem is understandable without prior context
- If the problem statement remains too vague, ask the user for more context to clarify system understanding, impact, or success criteria
