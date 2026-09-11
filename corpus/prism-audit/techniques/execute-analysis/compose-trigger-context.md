---
metadata:
  version: 1.1.0
---

## Capability

Resolves the context one audit scope's analysis run is dispatched with.

## Outputs

### target

The scope's evaluation target, taken from `{current_scope}`.

### target_description

A short description of the scope for prism's Executive Summary scope statement — derived from the scope's focus (its `analysis_focus` / the audit domain the scope covers), not the bare path.

### output_path

The scope's own output location, which the run it is dispatched to writes into.

### pipeline_mode

The prism pipeline mode for the scope, taken from `{current_scope}`.

### analysis_focus

The scope's analysis focus, taken from `{current_scope}` — the audit prompt content naming the scope's security domains and focus areas. Naming the domains here is what yields domain-prefixed finding IDs the audit deliverables carry through.

## Protocol

- Set `{target}`, `{pipeline_mode}`, and `{analysis_focus}` from the corresponding fields of `{current_scope}`.
- Set `{target_description}` to a short description of the scope derived from its focus.
- Set `{output_path}` to the scope's `output_subdir` under `{audit_output_path}`.

## Rules

### pipeline-mode-selection

`pipeline_mode` defaults to `full-prism` (3-pass structural → adversarial → synthesis) for the depth a security audit needs; an individual scope may override to `behavioral` or `portfolio` when the prompt-generation activity determined a different mode fits that scope.
