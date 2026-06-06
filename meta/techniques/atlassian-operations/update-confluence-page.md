---
metadata:
  version: 1.0.0
---

## Capability

Update a Confluence page (full body replace).

## Inputs

### page-id

Page ID. Passed as the `pageId` parameter to the Atlassian MCP tools.

### body

New Markdown body

### title

Optional new title

## Protocol

1. Call `updateConfluencePage { cloud-id, page-id, body, title? }`.
