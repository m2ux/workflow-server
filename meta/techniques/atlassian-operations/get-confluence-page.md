---
metadata:
  version: 1.0.0
---

## Capability

Read a Confluence page as Markdown.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### pageId

Page ID

## Protocol

1. Call `getConfluencePage { cloudId, pageId, contentFormat: 'markdown' }`.
