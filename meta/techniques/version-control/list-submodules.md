---
metadata:
  version: 1.1.1
---

## Capability

Read and parse `.gitmodules` to enumerate the target-component submodules, excluding infrastructure submodules that every project carries — a submodule whose `path` equals `workflows`, equals `.engineering`, or is under `.engineering/` (`path` is `.engineering` or starts with `.engineering/`). Exact matches for top-level `workflows` and `.engineering` are retained. These are never a target component.

## Outputs

### submodules

Array of `{ path, name, url }` entries, one per target-component submodule. Infrastructure submodules whose `path` equals `workflows`, equals `.engineering`, or is under `.engineering/` (`path` is `.engineering` or starts with `.engineering/`) are omitted.

## Protocol

1. Read `.gitmodules`; parse each `[submodule "name"]` section to extract `path` and `url`.
2. Omit any section whose `path` equals `workflows`, equals `.engineering`, or is under `.engineering/` (`path` is `.engineering` or starts with `.engineering/`) — the infrastructure submodules present in every project (legacy exact matches for top-level `workflows` and `.engineering` retained). Collect one entry per remaining section into `{submodules}`.
