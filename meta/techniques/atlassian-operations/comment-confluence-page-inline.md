---
metadata:
  version: 1.0.0
---

## Capability

Add an inline (in-text) comment to a Confluence page.

## Inputs

### page-id

Page ID. Passed as the `pageId` parameter to the Atlassian MCP tools.

### body

Markdown body

### inline-comment-properties

Object describing the inline anchor. Passed as the `inlineCommentProperties` parameter to the Atlassian MCP tools.

## Protocol

1. Call `createConfluenceInlineComment { cloud-id, page-id, body, inline-comment-properties }`.
