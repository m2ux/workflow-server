---
metadata:
  version: 1.4.0
---

## Capability

Apply the requirements analysis (initial pass) or the validation findings (correction pass) to produce the complete updated specification, preserving the specification protocol verbatim.

## Inputs

### requirements_analysis

Structured analysis of the requirement changes to apply on the initial pass.

### validation_report

*(optional)* Categorized validation findings to address on a correction pass.

### target_doc_exists

`true` when the target specification already exists and its section structure is preserved; `false` when the full specification structure is instantiated from scratch.

## Outputs

### working_specification

The complete updated specification document for this pass.

#### artifact

`working-spec-{correction_iteration}.md`

#### audience

`human`

### working_specification_path

Absolute path to the written working specification for this pass.

### correction_iteration

Count of correction passes performed: `0` on the initial pass, and one greater than the preceding pass on each correction pass.

## Protocol

### 1. Apply Changes

- Operate in correction mode when `{validation_report}` carries correctable findings; otherwise operate in initial mode.
- In initial mode, apply each change in `{requirements_analysis}`: add source references, create new requirements with sequential identifiers, update existing requirements, and deprecate as directed.
  - Set every newly added requirement's status to `pending` per [specification-protocol](../resources/specification-protocol.md#status-conventions).
  - Preserve the existing section structure when `{target_doc_exists}`; instantiate the full [specification-protocol](../resources/specification-protocol.md#section-structure) structure when creating from scratch.
- In correction mode, address each correctable finding in `{validation_report}`: resolve a source-coverage finding by adding the missing requirement(s); otherwise change no requirement's meaning and introduce no new requirement.

### 2. Write Working Specification

- Write the complete `{working_specification}` to `{planning_folder_path}`; capture its written location as `{working_specification_path}` and emit `{correction_iteration}` for the pass just written.
