# get-confluence-page

Read a Confluence page as Markdown.

## Inputs

### cloudId

From [resolve-cloud-id](resolve-cloud-id.md)

### pageId

Page ID

## Procedure

1. Call `getConfluencePage({ cloudId, pageId, contentFormat: 'markdown' })`.
