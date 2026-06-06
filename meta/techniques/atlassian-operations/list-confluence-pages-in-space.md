---
metadata:
  version: 1.0.0
---

## Capability

List pages in a Confluence space.

## Inputs

### space-id

Space ID.

### title

Optional title filter

## Protocol

1. Call `getPagesInConfluenceSpace { cloud-id, space-id, title? }`.
