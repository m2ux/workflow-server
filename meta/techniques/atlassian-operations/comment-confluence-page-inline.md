---
metadata:
  version: 1.0.0
---

## Capability

Add an inline (in-text) comment to a Confluence page.

## Inputs

### pageId

Page ID.

### body

Markdown body

### inlineCommentProperties

Object describing the inline anchor.

## Protocol

1. Call `createConfluenceInlineComment { cloudId, pageId, body, inlineCommentProperties }`.
