---
metadata:
  version: 1.0.0
---

## Capability

Add a page-level (footer) comment to a Confluence page.

## Inputs

### pageId

Page ID

### body

Markdown body

## Protocol

1. Call `createConfluenceFooterComment { cloudId, pageId, body }`.
