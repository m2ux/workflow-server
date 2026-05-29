# update-confluence-page

Update a Confluence page (full body replace).

## Inputs

### cloudId

From [resolve-cloud-id](resolve-cloud-id.md)

### pageId

Page ID

### body

New Markdown body

### title

Optional new title

## Procedure

1. Call `updateConfluencePage { cloudId, pageId, body, title? }`.
