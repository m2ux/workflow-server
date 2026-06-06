---
metadata:
  version: 1.0.0
---

## Capability

Add an inline (in-text) comment to a Confluence page.

## Inputs

### page-id

Page ID.

### body

Markdown body

### inline-comment-properties

Object describing the inline anchor.

## Protocol

1. Call `createConfluenceInlineComment { cloud-id, page-id, body, inline-comment-properties }`.
