---
metadata:
  version: 1.0.0
---

## Capability

Reference checkout for comprehension and read-only investigation — standalone repo vs monorepo submodule.

## Inputs

### discovered_path

The path the user originally pointed at — the value resolved by start-workflow's target discovery.

## Outputs

### reference_path

The reference checkout root: the monorepo root when the discovered path is a submodule, otherwise the discovered path itself. Used for comprehension, GitNexus, and read-only investigation only.

### component_name

Basename of the discovered path (e.g. `midnight-node`).


## Protocol

1. Read `{discovered_path}` — the path the user originally pointed at.
2. Determine the repository shape: it is a monorepo submodule when the parent directory has a `.gitmodules` file listing the path's basename; otherwise it is a standalone repository.
3. Set `{reference_path}`: the monorepo root when `{discovered_path}` is a submodule, the discovered path itself when standalone.
4. Set `{component_name}` to the basename of `{discovered_path}` (e.g. `midnight-node`) in both cases.
