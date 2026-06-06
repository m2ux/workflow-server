---
metadata:
  version: 1.0.0
---

## Capability

Create a Confluence page.

## Inputs

### space-id

Target space ID.

### body

Markdown body

### title

Page title (optional)

### parent-id

Optional parent page ID.

## Protocol

1. Call `createConfluencePage { cloud-id, space-id, body, contentFormat: 'markdown', title?, parent-id? }`.
