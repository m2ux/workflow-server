---
metadata:
  version: 1.0.0
---

## Capability

Create a Confluence page.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### spaceId

Target space ID

### body

Markdown body

### title

Page title (optional)

### parentId

Optional parent page ID

## Protocol

1. Call `createConfluencePage { cloudId, spaceId, body, contentFormat: 'markdown', title?, parentId? }`.
