---
metadata:
  version: 1.1.0
---

## Capability

Create the design philosophy artifact, recording the problem statement, classification, complexity, and workflow path rationale.

## Inputs

### problem_statement

The problem definition recorded into the artifact.

### problem_type

The classification recorded into the artifact.

### problem_complexity

The complexity assessment recorded into the artifact.

### path_rationale

The workflow path rationale recorded into the artifact.

### planning_folder_path

Path to the planning artifacts folder where the artifact is created.

## Outputs

### design_philosophy_doc

The design philosophy [artifact](../../resources/design-framework.md#design-philosophy-artifact-template) (`design-philosophy.md`) created in `{planning_folder_path}`, recording the problem statement, classification, complexity, and workflow path rationale. This file is the record of truth for the classification.

#### artifact

`design-philosophy.md`

## Protocol

### 1. Document Philosophy

- Create the `{design_philosophy_doc}` artifact in `{planning_folder_path}`
- Include problem statement, classification, complexity, workflow path rationale
- Keep the problem statement to the template's 2–4 sentence ticket-derived budget — the canonical refined statement lands in `requirements-elicitation.md` once elicited; this document's unique content is the classification
