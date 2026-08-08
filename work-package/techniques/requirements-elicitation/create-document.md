---
metadata:
  version: 1.1.0
---

## Capability

Create the requirements document artifact capturing elicited requirements, success criteria, scope boundaries, and assumptions.

## Inputs

### success_criteria

The defined success criteria with verification methods, recorded into the artifact.

### scope_boundaries

The in/out scope definitions, recorded into the artifact.

### elicitation_log

The record of questions asked and responses given, recorded into the artifact as the provenance of the captured requirements.

## Outputs

### requirements_document

The requirements [artifact](../../resources/requirements-elicitation.md#document-template) (`requirements-elicitation.md`) created in `{planning_folder_path}`, capturing the elicited requirements, success criteria, scope boundaries, and assumptions. This file is the record of truth for the elicited requirements and the canonical home for the problem statement, scope, and success criteria — downstream artifacts link here.

#### artifact

`requirements-elicitation.md`

## Protocol

### 1. Create Document

- Create the `{requirements_document}` artifact in `{planning_folder_path}`
- Include elicited requirements, success criteria, scope boundaries, and assumptions
- Record assumptions in the assumptions log and deferred scope items in the deferred-items register (link-only slots in this document, per its template)
