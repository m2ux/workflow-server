---
metadata:
  version: 1.3.0
---

## Capability

Assemble the validation-passed specification and a human-readable change summary as planning-folder artifacts.

## Inputs

### working_specification

The validation-passed specification document.

### requirements_analysis

The structured analysis of requirement changes.

## Outputs

### final_specification

The finalized specification staged in the planning folder.

#### artifact

`final-spec.md`

#### audience

`human`

### final_specification_path

Absolute path to the staged final specification.

### change_summary

Human-readable summary of all applied changes and the validation status.

#### artifact

`change-summary.md`

#### audience

`human`

### change_summary_path

Absolute path to the written change summary.

## Protocol

### 1. Assemble Final Specification

- Copy the validation-passed `{working_specification}` into `{final_specification}` in `{planning_folder_path}`; capture its written location as `{final_specification_path}`.

### 2. Write Change Summary

- Summarize the applied changes — new, updated, and deprecated requirements and added sources — from `{requirements_analysis}` into `{change_summary}` using the [change-summary template](../resources/change-summary.md#template) and its [Rules](../resources/change-summary.md#rules); capture its written location as `{change_summary_path}`.

## Rules

### promotion-outside-this-operation

Promotion to `{target_doc_path}` is outside this operation.
