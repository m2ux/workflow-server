---
metadata:
  version: 1.0.0
---

## Capability

Compose the prism trigger context for one execution group: the target, its type in prism's vocabulary, the scope description, the output location, the pipeline mode, the lens selection, and the analysis focus the run is dispatched with.

## Outputs

### target

The evaluation target the group's run analyses.

### target_type

The target's kind in the analysis run's vocabulary: `general` for prose targets, `code` for source trees.

### target_description

A short description of what the group evaluates — its dimension name(s) and focus — for the run's report scope statement.

### output_path

The group's own output location, which the run it is dispatched to writes into.

### pipeline_mode

The prism pipeline mode the group runs under, taken from `{current_group}`.

### selected_lenses

The lens indices the group's run applies, taken from `{current_group}`.

### analysis_focus

What the group's run examines, taken from `{current_group}`. Naming the group's dimension(s) here yields dimension-prefixed finding IDs the consolidation inherits.

## Protocol

### 1. Unpack the Group

- Set `{pipeline_mode}`, `{selected_lenses}`, and `{analysis_focus}` from the corresponding fields of `{current_group}`.
- Set `{output_path}` to the group's `output_subdir` under `{evaluation_output_path}`.

### 2. Resolve the Target

- Set `{target}` to `{target_path}`.
- Set `{target_type}` from `{evaluation_target_type}` per `target-type-vocabulary`.
- Set `{target_description}` from the group's dimension name(s) and focus.

## Rules

### target-type-vocabulary

The analysis run reads two target kinds where the evaluation classifies four. A `document`, `document-set`, or `mixed` classification is `general`; a `codebase` classification is `code`.
