---
metadata:
  version: 1.1.0
---

## Capability

Apply the requirements analysis (initial pass) or the validation findings (correction pass) to produce the complete updated specification, preserving the specification protocol verbatim.

## Inputs

### requirements_analysis

Structured analysis of the requirement changes to apply on the initial pass.

### validation_report

*(optional)* Categorized validation findings to address on a correction pass.

## Protocol

### 1. Determine Mode

- Operate in correction mode when `{validation_report}` carries correctable findings; otherwise operate in initial mode.

### 2. Apply Changes — Initial Mode

- Apply each change in `{requirements_analysis}`: add `SRC-MTG###` source references, create new requirements with sequential identifiers, update existing requirements, and deprecate as directed.
- Set every newly added requirement's status to `pending`.
- Preserve the existing section structure when `{target_doc_exists}`; instantiate the full [specification-protocol](../resources/specification-protocol.md#section-structure) structure when creating from scratch.

### 3. Apply Corrections — Correction Mode

- Address each correctable finding in `{validation_report}`: resolve a source-coverage finding by adding the missing requirement(s); otherwise change no requirement's meaning and introduce no new requirement.

### 4. Write Working Specification

- Write the complete `{working_specification}` to `{planning_folder_path}`.

## Output

### working_specification

The complete updated specification document for this pass.

#### artifact

`working-spec-{correction_iteration}.md`

## Rules

### new-requirements-are-pending

A newly added requirement takes status `pending`; a status change away from `pending` follows explicit user confirmation.

### corrections-preserve-meaning

On a correction pass, only the reported findings are addressed: a source-coverage finding is resolved by adding the missing requirement, and otherwise no requirement is added and no requirement's meaning is changed.
