# create-confluence-page

Create a Confluence page.

## Inputs

- **cloudId** — From [resolve-cloud-id](resolve-cloud-id.md)
- **spaceId** — Target space ID
- **body** — Markdown body
- **title** — Page title (optional)
- **parentId** — Optional parent page ID

## Procedure

1. Call `createConfluencePage({ cloudId, spaceId, body, contentFormat: 'markdown', title?, parentId? })`.
