---
metadata:
  version: 1.2.0
---

## Capability

Assemble the per-file drafting plan — schema constructs to use, reference patterns to follow, and intended content structure — and persist it for activity-layer review. Drafting and per-file schema validation are performed via [yaml-authoring](yaml-authoring.md).

## Inputs

### current_file

The scope-manifest entry being drafted — its path, action (create/modify/remove), type, and one-line description.

### operation_type

The classified operation. When `update`, the approach frames the change against the file's existing content rather than a from-scratch draft.

## Outputs

### drafting_plan

The per-file drafting plan for `{current_file}`: schema constructs to use (from [schema-construct-inventory](../resources/schema-construct-inventory.md)), reference patterns to follow, and intended content structure.

### drafting_plan_path

Absolute path to the persisted drafting-plan artifact for the current file.

#### artifact

`drafting-plan.md`

## Protocol

### 1. Assemble Drafting Plan

- Assemble `{drafting_plan}` for `{current_file}`: the schema constructs to be used, the reference patterns to be followed, and the intended content structure

### 2. Persist Drafting Plan

- Persist `{drafting_plan}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `drafting-plan.md` (updated in place each file iteration)
- Capture the written location as `{drafting_plan_path}`
