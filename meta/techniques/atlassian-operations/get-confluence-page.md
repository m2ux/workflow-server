---
metadata:
  version: 1.0.0
---

## Capability

Read a Confluence page as Markdown.

## Inputs

### page-id

Page ID.

## Protocol

1. Call `getConfluencePage { cloud-id, page-id, contentFormat: 'markdown' }`.
