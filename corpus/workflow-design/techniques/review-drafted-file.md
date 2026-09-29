---
metadata:
  version: 1.6.0
---

## Capability

Lean review note for a drafted file — delivered delta and (on update) removals.

## Inputs

### current_file

The scope-manifest entry just drafted — its path, action, type, and one-line description.

## Outputs

### file_review_note

Per-file delta note for `{current_file}`, at the shape [Template](../resources/file-review-note.md#template) declares.

#### artifact

`file-review-note.md`

#### audience

`human`

### has_unflagged_removals

True when `{operation_type}` is `update` and the content comparison detects material being removed that is not already in the removals inventory; false otherwise.

## Protocol

### 1. Assemble Review Note

- Assemble `{file_review_note}` for `{current_file}` at the shape [Template](../resources/file-review-note.md#template) declares
- When `{operation_type}` is `update`, compare against committed content, and set `{has_unflagged_removals}` true when material removed relative to committed content is not in the removals inventory
