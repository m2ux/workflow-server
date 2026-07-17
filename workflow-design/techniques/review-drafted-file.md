---
metadata:
  version: 1.2.0
---

## Capability

Assemble a review note for a drafted file — schema constructs used, notable design decisions, and (when updating) material removals versus committed content — and persist it for activity-layer review.

## Inputs

### current_file

The scope-manifest entry just drafted — its path, action, type, and one-line description.

### operation_type

The classified operation. When `update`, the review compares the drafted content against the file's existing committed content and records removals.

## Outputs

### file_review_note

Structured review note for `{current_file}`: constructs used, notable design decisions, and when `{operation_type}` is `update`, the removal comparison summary.

### file_review_note_path

Absolute path to the persisted file-review note (updated in place each file iteration).

#### artifact

`file-review-note.md`

### removal_inventory

When `{operation_type}` is `update`, the list of material being removed relative to the committed content; empty when none or when not updating.

### has_unflagged_removals

True when `{operation_type}` is `update` and the content comparison detects material being removed that was not already inventoried during impact analysis; false otherwise.

## Protocol

### 1. Assemble Review Note

- Assemble `{file_review_note}` for `{current_file}`: schema constructs used and notable design decisions
- When `{operation_type}` is `update`, compare the new content against the existing content; record `{removal_inventory}` into the note and set `{has_unflagged_removals}` true when a removal was not inventoried during impact analysis

### 2. Persist Review Note

- Persist `{file_review_note}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `file-review-note.md`
- Capture the written location as `{file_review_note_path}`
