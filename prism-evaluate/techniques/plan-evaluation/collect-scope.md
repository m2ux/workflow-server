---
metadata:
  version: 2.0.0
---

## Capability

Establishes the evaluation scope from the user's request — what to evaluate, against what goals, and where the artifacts land.

## Outputs

### target_path

Path to the target to evaluate, as supplied by the user.

### target_name

The target's base name.

### evaluation_description

The user's description of evaluation goals, focus areas, and concerns.

### output_path

Directory for the evaluation artifacts: the directory the user supplied, or one named from `{target_name}` and the current date when the user supplied none.

### dimensions

*(optional)* Evaluation dimensions supplied by the user, each `{ name, description, focus_areas }`. Absent when the user supplied none.

### lens_overrides

*(optional)* Lens overrides supplied by the user, keyed by dimension name, each `{ pipeline_mode, lenses }`. Absent when the user supplied none.

## Protocol

### 1. Read the Request

- Read `{target_path}` and `{evaluation_description}` from the request, and derive `{target_name}` as the base name of `{target_path}`.

### 2. Resolve the Scope

- Resolve `{output_path}`, and capture `{dimensions}` and `{lens_overrides}` where the request carries them.
