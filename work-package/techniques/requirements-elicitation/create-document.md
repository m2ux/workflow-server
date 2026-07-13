---
metadata:
  version: 1.1.0
---

## Capability

Create the requirements document artifact capturing elicited requirements, success criteria, scope boundaries, and assumptions.

## Inputs

### requirements

The captured requirements list from [elicit](./elicit.md), recorded into the artifact.

### success_criteria

The defined success criteria with verification methods from [elicit](./elicit.md), recorded into the artifact.

### scope_boundaries

The in/out scope definitions from [elicit](./elicit.md), recorded into the artifact.

### planning_folder_path

Path to the planning artifacts folder where the artifact is created.

## Outputs

### requirements_document

The requirements [artifact](../../resources/requirements-elicitation.md#document-template) (`requirements-elicitation.md`) created in `{planning_folder_path}`, capturing the elicited requirements, success criteria, scope boundaries, and assumptions. This file is the record of truth for the elicited requirements and the [canonical home](../manage-artifacts/TECHNIQUE.md#canonical-home-map) for the problem statement, scope, and success criteria — downstream artifacts link here.

#### artifact

`requirements-elicitation.md`

## Protocol

### 1. Create Document

- Create the `{requirements_document}` artifact in `{planning_folder_path}`
- Include elicited requirements, success criteria, scope boundaries, and assumptions
- Record assumptions in the assumptions log and deferred scope items in the deferred-items register (link-only slots in this document, per its template)
