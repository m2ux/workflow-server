---
metadata:
  version: 1.0.0
---

## Capability

Update a Confluence page (full body replace).

## Inputs

### pageId

Page ID

### body

New Markdown body

### title

Optional new title

## Protocol

1. Call `updateConfluencePage { cloudId, pageId, body, title? }`.
