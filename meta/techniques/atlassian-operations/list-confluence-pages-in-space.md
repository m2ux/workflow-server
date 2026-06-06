---
metadata:
  version: 1.0.0
---

## Capability

List pages in a Confluence space.

## Inputs

### space-id

Space ID. Passed as the `spaceId` parameter to the Atlassian MCP tools.

### title

Optional title filter

## Protocol

1. Call `getPagesInConfluenceSpace { cloud-id, space-id, title? }`.
