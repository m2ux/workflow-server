Read a Confluence page as Markdown.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### pageId

Page ID

## Protocol

1. Call `getConfluencePage { cloudId, pageId, contentFormat: 'markdown' }`.
