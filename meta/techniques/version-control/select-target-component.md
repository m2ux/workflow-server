---
metadata:
  version: 1.2.1
---

## Capability

Identify the unambiguous target component in a submodule monorepo, or flag ambiguity.

## Inputs

### submodules

The enumerated target-component submodules (infrastructure submodules already excluded).

### identifying_context

*(optional)* Request context that may name the intended target component.

### component_hint

*(optional)* Basename of the component the workspace path already sits inside, as derived from git.

### mentioned_repo

*(optional)* Repository named in the user's request, such as the `owner/repo` of a PR or issue URL — version-control.host-is-derived-component-is-named.

## Outputs

### component_path

Path of the single component when exactly one exists; unset when more than one does.

### component_selection_needed

true when two or more target-component submodules exist; false when the target was auto-resolved.

## Protocol

1. If `{submodules}` has exactly one entry, set `{component_path}` to that entry's `path` and `{component_selection_needed}` = false — the target is unambiguous.
2. If `{submodules}` has more than one entry, set `{component_selection_needed}` = true and leave `{component_path}` unset. Rank a recommended component from the context available, in descending order of authority: `{component_hint}` when it matches a component's `path` basename, then `{mentioned_repo}` when its repository segment does, then `{identifying_context}` when it clearly names one.
