---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Apply structured design framework to classify problems, assess complexity, and determine workflow path

## Inputs

### issue_details

Summary, description, and context from the linked issue

### problem_context

*(optional)* Additional context about the problem from user or prior activities

## Protocol

### 1. Load Framework

- Use attached [design-framework](../resources/design-framework.md) for full guidance
- Review `{issue_details}` and `{problem_context}`

### 2. Define Problem

- Create clear problem statement with system understanding
- Document impact assessment
- Define success criteria and constraints
- Ensure problem is understandable without prior context
- If the problem statement remains too vague, ask the user for more context to clarify system understanding, impact, or success criteria

### 3. Classify Problem

- Determine if specific problem (cause known/unknown) or inventive goal (improvement/prevention)
- Assess complexity as simple, moderate, or complex
- If preliminary target symbols can be inferred from the issue, apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[complexity-signal](./gitnexus-operations/complexity-signal.md) `{target}` for an objective complexity signal — high fan-out or many affected processes indicate higher complexity than the issue text suggests.
- Document classification rationale

### 4. Determine Path

- Map complexity to workflow path (full, elicitation-only, research-only, or skip optional activities)
- Document path rationale
- Set needs-elicitation, needs-research, skip-optional-activities accordingly
- For simple changes, lightweight application is acceptable — not every bug fix needs full elicitation

### 5. Document Philosophy

- Create the `{design_philosophy_doc}` artifact in `{planning_folder_path}`
- Include problem statement, classification, complexity, workflow path rationale

### 6. Create Assumptions Log

- Identify assumptions made during problem classification and path selection
- Create the `{assumptions_log}` artifact with initial assumptions
- Create assumptions log here — first activity that makes decisions requiring assumptions

## Outputs

### design_philosophy_doc

Records problem classification, design [rationale](../resources/design-framework.md#design-philosophy-artifact-template), and workflow path decisions

#### design_philosophy_artifact

`design-philosophy.md`

#### problem_statement

Clear problem definition with system understanding

#### problem_type

Specific problem or inventive goal

#### complexity

simple, moderate, or complex

### assumptions_log

[Log](../resources/assumptions-review.md#assumptions-log-template) of assumptions made during design philosophy

#### assumptions_log_artifact

`assumptions-log.md`

## Rules

### path-determines-workflow

Design philosophy determines the path through the workflow — all subsequent activities depend on this classification
