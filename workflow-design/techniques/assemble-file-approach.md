---
metadata:
  version: 1.4.0
---

## Capability

Lean per-file drafting plan — the delta for this file only.

## Inputs

### current_file

The scope-manifest entry being drafted — its path, action (create/modify/remove), type, and one-line description.

### operation_type

The classified operation. When `update`, the approach frames the change against the file's existing content rather than a from-scratch draft.

### preservation_required

*(optional)* Whether the reader asked at impact analysis for flagged content to survive. Where it holds, the approach states what each file keeps and how the change works around it, so the decision is honoured at drafting rather than raised again once a removal is detected.

### pattern_adoption

*(optional)* How far the pattern analysis is adopted. `all` frames the approach on the extracted conventions throughout; `selective` applies the subset the reader chose and states which; `diverge` frames the approach on the workflow's own requirements and records why the comparable structures do not fit. `none` where no pattern analysis ran, which is the update path — there the approach is framed against the file's existing content alone.

## Outputs

### drafting_plan

The per-file delta for `{current_file}` following the [Drafting Plan Guide](../resources/drafting-plan.md#template).

#### artifact

`drafting-plan.md`

#### audience

`human`

### drafting_plan_path

Absolute path to the persisted drafting-plan artifact for the current file.

## Protocol

### 1. Assemble Drafting Plan

- Assemble `{drafting_plan}` for `{current_file}` following the [Drafting Plan Guide](../resources/drafting-plan.md#template)
- When `{operation_type}` is `update`, frame against existing content
- Drafting and per-file schema validation are out of scope (see [yaml-authoring](yaml-authoring.md))

### 2. Persist Drafting Plan

- Persist `{drafting_plan}` (updated in place each file iteration) per [drafting-plan](../resources/drafting-plan.md#template)
- Capture the written location as `{drafting_plan_path}`
