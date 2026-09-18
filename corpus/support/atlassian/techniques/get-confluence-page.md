---
metadata:
  version: 1.0.0
---

## Capability

Read a Confluence page as Markdown.

## Inputs

### pageId

Page ID.

## Outputs

### page_body

The page's content as Markdown.

## Protocol

1. Call `getConfluencePage { cloudId, pageId, contentFormat: 'markdown' }`; return the page content as `{page_body}`.
