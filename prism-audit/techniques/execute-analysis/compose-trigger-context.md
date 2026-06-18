---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Compose the prism trigger context for the current audit scope: unpack `{current_scope}` into the target, output path, pipeline mode, and analysis focus that the prism trigger passes to the run.

## Outputs

### target

The scope's evaluation target, taken from `{current_scope}`.

### output_path

The scope's output location — its `output_subdir` under the audit output directory.

### pipeline_mode

The prism pipeline mode for the scope, taken from `{current_scope}`.

### analysis_focus

The scope's analysis focus, taken from `{current_scope}` — the audit prompt content describing the scope's security focus areas.

## Rules

### trigger-isolation

`analysis_focus` is set from the audit prompt content describing the scope's security focus areas; it is NEVER the literal string `security audit` — that would activate prism's built-in audit-finalize activity and duplicate the post-processing this workflow performs in its own audit-finalize activity.

### pipeline-mode-selection

`pipeline_mode` defaults to `full-prism` (3-pass structural → adversarial → synthesis) for the depth a security audit needs; an individual scope may override to `behavioral` or `portfolio` when the prompt-generation activity determined a different mode fits that scope.

## Protocol

- Set `{target}`, `{pipeline_mode}`, and `{analysis_focus}` from the corresponding fields of `{current_scope}`.
- Set `{output_path}` to the scope's output location (its `output_subdir` under the audit output directory).
