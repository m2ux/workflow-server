---
metadata:
  version: 1.1.2
---

## Capability

Read and parse `.gitmodules` to enumerate the target-component submodules, excluding infrastructure submodules per [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths.

## Outputs

### submodules

Array of `{ path, name, url }` entries, one per target-component submodule. Infrastructure submodules (per [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths) are omitted.

## Protocol

1. Read `.gitmodules`; parse each `[submodule "name"]` section to extract `path` and `url`.
2. Omit infrastructure submodules — apply [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths. Collect one entry per remaining section into `{submodules}`.
