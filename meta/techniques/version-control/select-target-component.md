---
metadata:
  version: 1.1.0
---

## Capability

Identify the unambiguous target component in a submodule monorepo, or flag ambiguity.

## Inputs

### submodules

The enumerated target-component submodules (infrastructure submodules already excluded).

### identifying_context

Optional request context that may name the intended target component (used to pre-select when more than one component exists).

### component_hint

Optional. Basename of the component the session was opened inside, as derived from git by [resolve-host-repo](./resolve-host-repo.md). The strongest pre-selection signal available, because it reflects where the user actually is rather than what the request mentioned.

### mentioned_repo

Optional. Repository named in the user's request, such as the `owner/repo` of a PR or issue URL. Component context only — it never binds the session, per [version-control](./TECHNIQUE.md)::host-is-derived-component-is-named.

## Outputs

### component_path

Set to the single component's `path` when exactly one component exists. Left for the submodule-selection checkpoint to resolve when more than one exists.

### component_selection_needed

true when two or more target-component submodules exist (the submodule-selection checkpoint then prompts); false when the target was auto-resolved.

## Protocol

1. If `{submodules}` has exactly one entry, set `{component_path}` to that entry's `path` and `{component_selection_needed}` = false — the target is unambiguous, no prompt.
2. If `{submodules}` has more than one entry, set `{component_selection_needed}` = true and leave `{component_path}` for the submodule-selection checkpoint. Pre-select a recommended option from the component context, in descending order of authority: `{component_hint}` when it matches a component's `path` basename, then `{mentioned_repo}` when its repository segment does, then `{identifying_context}` when it clearly names one. Pre-selection recommends an option; it never resolves the checkpoint.
