---
metadata:
  version: 1.0.0
---

## Capability

Create a Confluence page.

## Inputs

### space-id

Target space ID. Passed as the `spaceId` parameter to the Atlassian MCP tools.

### body

Markdown body

### title

Page title (optional)

### parent-id

Optional parent page ID. Passed as the `parentId` parameter to the Atlassian MCP tools.

## Protocol

1. Call `createConfluencePage { cloud-id, space-id, body, contentFormat: 'markdown', title?, parent-id? }`.
