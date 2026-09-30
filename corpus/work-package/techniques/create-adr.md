---
metadata:
  version: 1.2.1
---

## Capability

An Architecture Decision Record for the work package, numbered next in the record directory and opening at Proposed.

## Inputs

### design_philosophy_doc

Design philosophy [artifact](../resources/design-framework.md#design-philosophy-artifact-template) with the problem statement and its classification

### adr_dir

Directory holding the project's ADR files

#### default

`.engineering/artifacts/adr/`

## Outputs

### adr_document

[Architecture Decision Record](../resources/adr.md#template)

#### artifact

`NNNN-{decision_title}.md`

#### audience

`human`

## Protocol

### 1. Determine Number

- Scan `{adr_dir}` for existing ADR files
- Determine next sequential NNNN number
- If the next number cannot be determined, re-scan `{adr_dir}` and use the next available number.

### 2. Gather Context

- Read the `{design_philosophy_doc}` for the problem the decision answers.
- Review the plan and the implementation analysis in `{planning_folder_path}` for the architectural choices, their rationale and their trade-offs
- Identify alternatives that were considered and rejected

### 3. Write Adr

- Write the `{adr_document}` as `NNNN-{$decision_title}.md` in `{adr_dir}` per [adr](../resources/adr.md#template) and its [Rules](../resources/adr.md#rules), deriving `{$decision_title}` as a slugified short title of the decision

