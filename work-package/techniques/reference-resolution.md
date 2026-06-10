---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Resolve the reference checkout used for comprehension, GitNexus indexing, and read-only investigation: determine whether the path the user pointed at is a standalone repository or a submodule inside a monorepo, and set the reference path and component name accordingly. Edits never happen here — they happen in a worktree created later.

## Inputs

### discovered_path

The path the user originally pointed at — the value resolved by start-workflow's target discovery.

## Protocol

1. Read `{discovered_path}` — the path the user originally pointed at.
2. Determine the repository shape: it is a monorepo submodule when the parent directory has a `.gitmodules` file listing the path's basename; otherwise it is a standalone repository.
3. Set `reference_path`: the monorepo root when `{discovered_path}` is a submodule, the discovered path itself when standalone.
4. Set `component_name` to the basename of `{discovered_path}` (e.g. `midnight-node`) in both cases.

## Outputs

### reference_path

The reference checkout root: the monorepo root when the discovered path is a submodule, otherwise the discovered path itself. Used for comprehension, GitNexus, and read-only investigation only.

### component_name

Basename of the discovered path (e.g. `midnight-node`).
