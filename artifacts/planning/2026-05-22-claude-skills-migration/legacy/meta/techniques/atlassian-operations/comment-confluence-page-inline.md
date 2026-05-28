# comment-confluence-page-inline

Add an inline (in-text) comment to a Confluence page.

## Inputs

- **cloudId** — From [resolve-cloud-id](resolve-cloud-id.md)
- **pageId** — Page ID
- **body** — Markdown body
- **inlineCommentProperties** — Object describing the inline anchor

## Procedure

1. Call `createConfluenceInlineComment({ cloudId, pageId, body, inlineCommentProperties })`.
