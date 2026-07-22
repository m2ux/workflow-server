---
metadata:
  version: 1.0.0
---

## Capability

Identify the unambiguous target component in a submodule monorepo, or flag ambiguity.

## Inputs

### submodules

The enumerated target-component submodules (infrastructure submodules already excluded).

### identifying_context

Optional request context that may name the intended target component (used to pre-select when more than one component exists).

## Outputs

### target_path

Set to the single component's `path` when exactly one component exists. Left for the submodule-selection checkpoint to resolve when more than one exists.

### component_selection_needed

true when two or more target-component submodules exist (the submodule-selection checkpoint then prompts); false when the target was auto-resolved.

## Protocol

1. If `{submodules}` has exactly one entry, set `{target_path}` to that entry's `path` and `{component_selection_needed}` = false — the target is unambiguous, no prompt.
2. If `{submodules}` has more than one entry, set `{component_selection_needed}` = true and leave `{target_path}` for the submodule-selection checkpoint. When `{identifying_context}` clearly names one of the components, pre-select it as the recommended option.
