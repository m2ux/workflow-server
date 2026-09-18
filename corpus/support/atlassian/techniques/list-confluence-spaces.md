---
metadata:
  version: 1.0.0
---

## Capability

List spaces accessible to the current user.

## Outputs

### accessible_spaces

Spaces the current user can reach, one entry per space.

## Protocol

1. Call `getConfluenceSpaces { cloudId, ...filters }`; return the listing as `{accessible_spaces}`.
