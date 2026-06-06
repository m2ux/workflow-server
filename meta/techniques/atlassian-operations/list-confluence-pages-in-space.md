---
metadata:
  version: 1.0.0
---

## Capability

List pages in a Confluence space.

## Inputs

### spaceId

Space ID.

### title

Optional title filter

## Protocol

1. Call `getPagesInConfluenceSpace { cloudId, spaceId, title? }`.
