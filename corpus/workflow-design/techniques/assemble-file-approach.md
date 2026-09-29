---
metadata:
  version: 1.5.0
---

## Capability

Lean per-file drafting plan — the delta for this file only.

## Inputs

### current_file

The scope-manifest entry being drafted — its path, action (create/modify/remove), type, and one-line description.

### preservation_required

*(optional)* Whether flagged content must survive the change. Where it holds, the approach states what each file keeps and how the change works around it.

### pattern_adoption

*(optional)* How far the pattern analysis is adopted. `all` frames the approach on the extracted conventions throughout; `selective` applies the subset the reader chose and states which; `diverge` frames the approach on the workflow's own requirements and records why the comparable structures do not fit. `none` where no pattern analysis ran; the approach is then framed against the file's existing content.

## Outputs

### drafting_plan

The per-file delta for `{current_file}`, at the shape [Template](../resources/drafting-plan.md#template) declares.

#### artifact

`drafting-plan.md`

#### audience

`human`

## Protocol

### 1. Assemble Drafting Plan

- Assemble `{drafting_plan}` for `{current_file}` at the shape [Template](../resources/drafting-plan.md#template) declares
- When `{operation_type}` is `update`, frame against existing content
- Drafting and per-file schema validation are out of scope (see [yaml-authoring](yaml-authoring.md))
