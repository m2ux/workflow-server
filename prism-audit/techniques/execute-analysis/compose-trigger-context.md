---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Compose the prism trigger context for the current audit scope: unpack `{current_scope}` into the target, target description, output path, pipeline mode, and analysis focus that the prism trigger passes to the run.

## Outputs

### target

The scope's evaluation target, taken from `{current_scope}`.

### target_description

A short description of the scope for prism's Executive Summary scope statement — derived from the scope's focus (its `analysis_focus` / the audit domain the scope covers), not the bare path.

### output_path

The scope's output location — its `output_subdir` under the audit output directory.

### pipeline_mode

The prism pipeline mode for the scope, taken from `{current_scope}`.

### analysis_focus

The scope's analysis focus, taken from `{current_scope}` — the audit prompt content describing the scope's security focus areas. Naming the scope's security domain(s) here lets prism assign domain-prefixed finding IDs, so the audit does not re-number findings downstream.

## Rules

### pipeline-mode-selection

`pipeline_mode` defaults to `full-prism` (3-pass structural → adversarial → synthesis) for the depth a security audit needs; an individual scope may override to `behavioral` or `portfolio` when the prompt-generation activity determined a different mode fits that scope.

## Protocol

- Set `{target}`, `{pipeline_mode}`, and `{analysis_focus}` from the corresponding fields of `{current_scope}`.
- Set `{target_description}` to a short description of the scope derived from its focus.
- Set `{output_path}` to the scope's output location (its `output_subdir` under the audit output directory).
