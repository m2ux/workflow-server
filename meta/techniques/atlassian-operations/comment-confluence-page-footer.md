Add a page-level (footer) comment to a Confluence page.

## Inputs

### cloudId

From [resolve-cloud-id](./resolve-cloud-id.md)

### pageId

Page ID

### body

Markdown body

## Protocol

1. Call `createConfluenceFooterComment { cloudId, pageId, body }`.
