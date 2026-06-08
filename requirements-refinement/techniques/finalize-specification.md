---
metadata:
  version: 1.0.0
---

## Capability

Assemble the validation-passed specification and a human-readable change summary as planning-folder artifacts for human promotion.

## Inputs

### working_specification

The validation-passed specification document.

### requirements_analysis

The structured analysis of requirement changes, used to compose the change summary.

## Protocol

### 1. Assemble Final Specification

- Copy the validation-passed `{working_specification}` into `{final_specification}` in `{planning_folder_path}`.

### 2. Write Change Summary

- Summarize the applied changes — new, updated, and deprecated requirements and added sources — from `{requirements_analysis}` into `{change_summary}` using the [change-summary](../resources/change-summary.md) structure.

### 3. Present for Promotion

- Present `{final_specification}` and `{change_summary}` for the user to review and promote to `{target_doc_path}`.

## Output

### final_specification

The finalized specification staged for promotion.

#### artifact

`final-spec.md`

### change_summary

Human-readable summary of all applied changes and the validation status.

#### artifact

`change-summary.md`

## Rules

### promotion-is-the-users-action

The finalized specification is staged in `{planning_folder_path}`; promotion to the canonical location is performed by the user.
