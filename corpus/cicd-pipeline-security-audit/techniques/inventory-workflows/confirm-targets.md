---
metadata:
  version: 1.0.0
---

## Capability

Resolve and validate the target submodules in scope: when `all`, enumerate every submodule containing a `.github/workflows/` directory; otherwise validate that each named path exists.

## Protocol

### 1. Confirm Targets

- Resolve `{target_submodules}`: when `all`, enumerate every submodule containing a `.github/workflows/` directory; otherwise validate that each named path exists.  
  > If no target submodules are specified and none are found, fail with an error listing the available submodules.
