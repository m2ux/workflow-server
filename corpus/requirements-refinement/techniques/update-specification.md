---
metadata:
  version: 1.10.4
---

## Capability

Apply requirement changes, validation findings, or requested revisions to produce the complete updated specification, preserving the specification protocol verbatim.

## Inputs

### update_pass_kind

Which apply this pass performs.

### requirements_analysis

Structured analysis of the requirement changes, each new or updated requirement carrying the source identifier and verbatim heading of each contributing passage.

### validation_report

*(optional)* Categorized validation findings.

### target_doc_exists

`true` when a file exists at `{target_doc_path}` (the specification is augmented); `false` when it is created from scratch.

### working_specification

*(optional)* The working specification the previous pass wrote. Unset before the first pass.

### revision_request

*(optional)* Text the user typed naming the revisions a staged specification or change summary needs. Unset until a revision is requested.

### update_pass

Number of the pass the previous working specification records; `0` before the first pass.

## Outputs

### working_specification

The complete updated specification document for this pass.

#### artifact

`working-spec-{update_pass}.md`

#### audience

`human`

### working_specification_path

Absolute path to the written working specification for this pass.

### update_pass

Number of the pass this working specification records: `0` when `{update_pass_kind}` is `initial`, and one more than the bound `{update_pass}` when it is `correction` or `revision`.

### correction_iteration

Count of correction passes performed so far, this pass included: one more than the bound `{correction_iteration}` when `{update_pass_kind}` is `correction`, and the bound value otherwise.

## Protocol

### 1. Apply Changes

- Apply the changes `{update_pass_kind}` names.
  > - When `{update_pass_kind}` is `initial`, apply each change in `{requirements_analysis}`: list each new source per [Source Listings](../resources/specification-protocol.md#source-listings) and add source references per [Source Reference Format](../resources/specification-protocol.md#source-reference-format), building each list from the change's citations — path from that source's section-2 record, fragment from the heading the change recorded, one list entry per recorded heading; create new requirements with identifiers per [Identifier Schemes](../resources/specification-protocol.md#identifier-schemes), update existing requirements, and deprecate as directed. A new or deprecated requirement takes its status per [Status Conventions](../resources/specification-protocol.md#status-conventions). Lay out the specification per the [Template](../resources/specification-protocol.md#template), whether it is augmented or created. An existing entry whose title opens with a status icon takes the status line that icon names in [Status Conventions](../resources/specification-protocol.md#status-conventions), and the status key is dropped.
  > - When `{update_pass_kind}` is `correction`, address each correctable finding in `{validation_report}` in `{working_specification}`: resolve a source-coverage finding by adding the missing requirement(s); otherwise change no requirement's meaning and introduce no new requirement.
  > - When `{update_pass_kind}` is `revision`, apply each revision `{revision_request}` names to `{working_specification}`: change no requirement's meaning except as the revision asks, and introduce no new requirement the revision does not ask for.
- Write each entry the pass adds or changes per [Requirement Entry Format](../resources/specification-protocol.md#requirement-entry-format), whatever wording `{requirements_analysis}` carries.

### 2. Write Working Specification

- Write the complete `{working_specification}` to `{planning_folder_path}` as pass `{update_pass}`; capture its written location as `{working_specification_path}` and emit `{update_pass}` and `{correction_iteration}` for the pass just written, each as its output contract defines it.
