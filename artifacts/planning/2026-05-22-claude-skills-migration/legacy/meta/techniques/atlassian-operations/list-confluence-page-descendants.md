# list-confluence-page-descendants

List child pages of a Confluence page.

## Inputs

### cloudId

From [resolve-cloud-id](resolve-cloud-id.md)

### pageId

Page ID

### depth

Optional traversal depth

### limit

Optional result limit

## Procedure

1. Call `getConfluencePageDescendants({ cloudId, pageId, depth?, limit? })`.
