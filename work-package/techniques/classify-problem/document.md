---
metadata:
  version: 1.0.0
---

## Capability

Create the design philosophy artifact, recording the problem statement, classification, complexity, and workflow path rationale.

## Inputs

### problem_statement

The problem definition from [define](./define.md), recorded into the artifact.

### problem_type

The classification from [classify](./classify.md), recorded into the artifact.

### complexity

The complexity assessment from [classify](./classify.md), recorded into the artifact.

### path_rationale

The workflow path rationale from [determine-path](./determine-path.md), recorded into the artifact.

### planning_folder_path

Path to the planning artifacts folder where the artifact is created.

## Output

### design_philosophy_doc

The design philosophy [artifact](../../resources/design-framework.md#design-philosophy-artifact-template) (`design-philosophy.md`) created in `{planning_folder_path}`, recording the problem statement, classification, complexity, and workflow path rationale (inherited from the [classify-problem](./TECHNIQUE.md) group root). This file is the record of truth for the classification.

## Protocol

### 1. Document Philosophy

- Create the `{design_philosophy_doc}` artifact in `{planning_folder_path}`
- Include problem statement, classification, complexity, workflow path rationale
