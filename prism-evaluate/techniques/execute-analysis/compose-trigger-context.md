---
metadata:
  version: 1.0.0
---

## Capability

Resolves the context one execution group's analysis run is dispatched with, translating the evaluation's own terms into the ones that run reads.

## Outputs

### target

The path the group's run analyses, which is the target under evaluation.

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

### 1. Locate the Group's Output

- Set `{output_path}` to the group's `output_subdir` under `{evaluation_output_path}`.

### 2. Translate the Target's Kind

- Set `{target_type}` from `{evaluation_target_type}` per `target-type-vocabulary`.

### 3. Describe the Group's Scope

- Set `{target_description}` from the dimension name(s) and focus `{current_group}` carries.

### 4. Carry the Rest Across

- Emit `{target}`, `{pipeline_mode}`, `{selected_lenses}` and `{analysis_focus}` per their Output criteria.

## Rules

### target-type-vocabulary

The analysis run reads two target kinds where the evaluation classifies four. A `document`, `document-set`, or `mixed` classification is `general`; a `codebase` classification is `code`.
