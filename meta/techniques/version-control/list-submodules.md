---
metadata:
  version: 1.1.2
---

## Capability

Enumerate target-component submodules from `.gitmodules`, excluding infrastructure paths.

## Outputs

### submodules

Array of `{ path, name, url }` entries, one per target-component submodule. Infrastructure submodules are omitted.

## Protocol

1. Read `.gitmodules`; parse each `[submodule "name"]` section to extract `path` and `url`.
2. Omit infrastructure submodules — apply [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths. Collect one entry per remaining section into `{submodules}`.
