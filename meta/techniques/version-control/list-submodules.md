---
metadata:
  version: 1.2.0
---

## Capability

Enumerate target-component submodules from the host repository's `.gitmodules`, excluding infrastructure paths.

## Outputs

### submodules

Array of `{ path, name, url }` entries, one per target-component submodule. Infrastructure submodules are omitted.

## Protocol

1. Read `{host_repo_path}/.gitmodules`; parse each `[submodule "name"]` section to extract `path` and `url`.
2. Omit infrastructure submodules, per `version-control.infrastructure-submodule-paths`. Collect one entry per remaining section into `{submodules}`.
