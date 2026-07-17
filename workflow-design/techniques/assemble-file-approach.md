---
metadata:
  version: 1.2.2
---

## Capability

Assemble a lean per-file drafting plan — the delta for this file only — and persist it for linked review. Drafting and per-file schema validation are out of scope for this technique (see [yaml-authoring](yaml-authoring.md)).

## Inputs

### current_file

The scope-manifest entry being drafted — its path, action (create/modify/remove), type, and one-line description.

### operation_type

The classified operation. When `update`, the approach frames the change against the file's existing content rather than a from-scratch draft.

## Outputs

### drafting_plan

The per-file delta for `{current_file}` following the [Drafting Plan Guide](../resources/drafting-plan.md#template).

### drafting_plan_path

Absolute path to the persisted drafting-plan artifact for the current file.

#### artifact

`drafting-plan.md`

## Protocol

### 1. Assemble Drafting Plan

- Assemble `{drafting_plan}` for `{current_file}` following the [Drafting Plan Guide](../resources/drafting-plan.md#template)
- When `{operation_type}` is `update`, frame against existing content

### 2. Persist Drafting Plan

- Persist `{drafting_plan}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `drafting-plan.md` (updated in place each file iteration) per [drafting-plan](../resources/drafting-plan.md)
- Capture the written location as `{drafting_plan_path}`
