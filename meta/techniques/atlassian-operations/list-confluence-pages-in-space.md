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

## Outputs

### space_pages

Pages in the space, one entry per page.

## Protocol

1. Call `getPagesInConfluenceSpace { cloudId, spaceId, title? }`; return the listing as `{space_pages}`.
