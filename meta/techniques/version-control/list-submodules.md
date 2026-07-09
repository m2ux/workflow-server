---
metadata:
  version: 1.1.0
---

## Capability

Read and parse `.gitmodules` to enumerate the target-component submodules, excluding the `workflows` and `.engineering` infrastructure submodules that every project carries.

## Outputs

### submodules

Array of `{ path, name, url }` entries, one per target-component submodule. The `workflows` and `.engineering` infrastructure submodules are omitted.

## Protocol

1. Read `.gitmodules`; parse each `[submodule "name"]` section to extract `path` and `url`.
2. Omit any section whose `path` is `workflows` or `.engineering` (infrastructure submodules, never a target component). Collect one entry per remaining section into `{submodules}`.
