---
metadata:
  version: 1.5.0
---

## Capability

Lean review note for a drafted file — delivered delta and (on update) removals.

## Inputs

### current_file

The scope-manifest entry just drafted — its path, action, type, and one-line description.

### operation_type

The classified operation — `create` or `update`.

## Outputs

### file_review_note

Per-file delta note for `{current_file}` following the [File Review Note Guide](../resources/file-review-note.md#template).

#### artifact

`file-review-note.md`

#### audience

`human`

### file_review_note_path

Absolute path to the persisted file-review note (updated in place each file iteration).

### has_unflagged_removals

True when `{operation_type}` is `update` and the content comparison detects material being removed that was not already inventoried during impact analysis; false otherwise.

## Protocol

### 1. Assemble Review Note

- Assemble `{file_review_note}` for `{current_file}` following the [File Review Note Guide](../resources/file-review-note.md#template)
- When `{operation_type}` is `update`, compare against committed content; record the removal inventory as `{$removal_inventory}` (the material being removed relative to committed content, empty when none) and set `{has_unflagged_removals}` true when a removal was not inventoried during impact analysis

### 2. Persist Review Note

- Persist `{file_review_note}` per [file-review-note](../resources/file-review-note.md#template)
- Capture the written location as `{file_review_note_path}`
