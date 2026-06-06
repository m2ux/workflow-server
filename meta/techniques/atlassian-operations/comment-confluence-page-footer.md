---
metadata:
  version: 1.0.0
---

## Capability

Add a page-level (footer) comment to a Confluence page.

## Inputs

### page-id

Page ID. Passed as the `pageId` parameter to the Atlassian MCP tools.

### body

Markdown body

## Protocol

1. Call `createConfluenceFooterComment { cloud-id, page-id, body }`.
