---
metadata:
  version: 1.2.0
---

## Capability

Assemble the validation-passed specification and a human-readable change summary as planning-folder artifacts for human promotion.

## Inputs

### working_specification

The validation-passed specification document.

### requirements_analysis

The structured analysis of requirement changes, used to compose the change summary.

## Outputs

### final_specification

The finalized specification staged for promotion.

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

- Summarize the applied changes — new, updated, and deprecated requirements and added sources — from `{requirements_analysis}` into `{change_summary}` using the [change-summary template](../resources/change-summary.md#template) and [conventions](../resources/change-summary.md#conventions); capture its written location as `{change_summary_path}`.

## Rules

### promotion-is-the-users-action

The finalized specification is staged in `{planning_folder_path}`; promotion to the canonical location is performed by the user.
