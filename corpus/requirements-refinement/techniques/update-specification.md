---
metadata:
  version: 1.6.0
---

## Capability

Apply requirement changes, validation findings, or requested revisions to produce the complete updated specification, preserving the specification protocol verbatim.

## Inputs

### update_pass_kind

Which apply this pass performs.

### requirements_analysis

Structured analysis of the requirement changes.

### validation_report

*(optional)* Categorized validation findings.

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

Count of correction passes performed so far.

## Protocol

### 1. Apply Changes

- Apply the changes `{update_pass_kind}` names.
  > - When `{update_pass_kind}` is `initial`, apply each change in `{requirements_analysis}`: add source references, create new requirements with sequential identifiers, update existing requirements, and deprecate as directed. Set every newly added requirement's status to `pending` per [specification-protocol](../resources/specification-protocol.md#status-conventions). Preserve the existing section structure when `{target_doc_exists}`; instantiate the full [specification-protocol](../resources/specification-protocol.md#section-structure) structure when creating from scratch.
  > - When `{update_pass_kind}` is `correction`, address each correctable finding in `{validation_report}`: resolve a source-coverage finding by adding the missing requirement(s); otherwise change no requirement's meaning and introduce no new requirement.
  > - When `{update_pass_kind}` is `revision`, apply the requested revisions to `{working_specification}`: change no requirement's meaning except as the revision asks, and introduce no new requirement the revision does not ask for.

### 2. Write Working Specification

- Write the complete `{working_specification}` to `{planning_folder_path}`; capture its written location as `{working_specification_path}` and emit `{correction_iteration}` for the pass just written.
