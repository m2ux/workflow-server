---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Establish the evaluation scope from the user's request: read the target path and the evaluation description, capture any user-supplied dimensions and lens overrides, derive the target's base name, and resolve the output directory.

## Outputs

### target_path

Path to the target to evaluate, as supplied by the user.

### target_name

The target's base name, derived from `{target_path}`.

### evaluation_description

The user's description of evaluation goals, focus areas, and concerns.

### output_path

Directory for the evaluation artifacts. Used as supplied by the user, or derived from `{target_name}` and the current date when none is supplied.

### dimensions

*(optional)* Evaluation dimensions supplied by the user, each `{ name, description, focus_areas }`. Absent when the user provides none — `derive-dimensions` then derives them.

### lens_overrides

*(optional)* User-specified lens overrides per dimension. Keys are dimension names, values are `{ pipeline_mode, lenses }`. Absent when the user provides none.

## Protocol

- Read `{target_path}` (the path to evaluate) and `{evaluation_description}` (the user's evaluation goals, focus areas, and concerns) from the request.
- Derive `{target_name}` as the base name of `{target_path}`.
- Resolve `{output_path}`: use the directory the user supplied, or derive it from `{target_name}` and the current date when none is supplied.
- Capture `{dimensions}` and `{lens_overrides}` when the user provides them; leave each absent otherwise.
