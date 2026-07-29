---
metadata:
  version: 1.2.0
---

## Capability

Enumerate target-component submodules from the host repository's `.gitmodules`, excluding infrastructure paths.

## Inputs

### host_repo_path

Absolute path of the host repository whose `.gitmodules` is enumerated.

## Outputs

### submodules

Array of `{ path, name, url }` entries, one per target-component submodule. Infrastructure submodules are omitted.

## Protocol

1. Read `{host_repo_path}/.gitmodules`; parse each `[submodule "name"]` section to extract `path` and `url`.
2. Omit infrastructure submodules — apply [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths. Collect one entry per remaining section into `{submodules}`.
