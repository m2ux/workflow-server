---
metadata:
  version: 1.2.1
---

## Capability

Design philosophy artifact — problem statement, classification, complexity, and workflow-path rationale.

## Inputs

### problem_type

The classification recorded into the artifact.

### problem_complexity

The complexity assessment recorded into the artifact.

### path_rationale

The workflow path rationale recorded into the artifact.

## Outputs

### design_philosophy_doc

The design philosophy [artifact](../../resources/design-framework.md#design-philosophy-artifact-template) carrying the problem statement, the classification, the complexity, and the workflow-path rationale. It is the record of truth for the classification.

#### artifact

`design-philosophy.md`

#### audience

`human`

## Protocol

### 1. Document Philosophy

- Create the `{design_philosophy_doc}` artifact in `{planning_folder_path}`
- Include `{problem_type}`, `{problem_complexity}`, and `{path_rationale}`
- Keep the problem statement to the template's 2–4 sentence ticket-derived budget. This document's unique content is the classification
