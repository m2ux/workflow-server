---
name: classify-problem
description: Classify a problem by type and complexity and select the workflow path.
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

### issue-details

Summary, description, and context from the linked issue

### problem-context

*(optional)* Additional context about the problem from user or prior activities

## Protocol

### 1. Load Framework

- Use attached [design-framework](../resources/design-framework.md) for full guidance
- Review issue_details and problem_context

### 2. Define Problem

- Create clear problem statement with system understanding
- Document impact assessment
- Define success criteria and constraints
- Ensure problem is understandable without prior context

### 3. Classify Problem

- Determine if specific problem (cause known/unknown) or inventive goal (improvement/prevention)
- Assess complexity as simple, moderate, or complex
- If preliminary target symbols can be inferred from the issue, apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[complexity-signal](./gitnexus-operations/complexity-signal.md) `{target}` for an objective complexity signal — high fan-out or many affected processes indicate higher complexity than the issue text suggests.
- Document classification rationale

### 4. Determine Path

- Map complexity to workflow path (full, elicitation-only, research-only, or skip optional activities)
- Document path rationale
- Set needs_elicitation, needs_research, skip_optional_activities accordingly
- For simple changes, lightweight application is acceptable — not every bug fix needs full elicitation

### 5. Document Philosophy

- Create design-philosophy.md artifact in planning folder
- Include problem statement, classification, complexity, workflow path rationale

### 6. Create Assumptions Log

- Identify assumptions made during problem classification and path selection
- Create assumptions-log.md artifact with initial assumptions
- Create assumptions log here — first activity that makes decisions requiring assumptions

## Outputs

### design-philosophy-doc

Records problem classification, design rationale, and workflow path decisions

- **artifact**: `design-philosophy.md`
- **problem_statement**: Clear problem definition with system understanding
- **problem_type**: Specific problem or inventive goal
- **complexity**: simple, moderate, or complex
- **workflow_path**: Determined path and rationale

### assumptions-log

Log of assumptions made during design philosophy

- **artifact**: `assumptions-log.md`
- **assumptions**: Assumptions with categories: Problem Interpretation, Complexity Assessment, Workflow Path

## Rules

### path-determines-workflow

Design philosophy determines the path through the workflow — all subsequent activities depend on this classification

## Errors

### unclear_problem

**Cause:** Problem statement too vague

**Recovery:** Ask user for more context — clarify system understanding, impact, or success criteria
