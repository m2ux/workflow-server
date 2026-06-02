List child pages of a Confluence page.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### pageId

Page ID

### depth

Optional traversal depth

### limit

Optional result limit

## Protocol

1. Call `getConfluencePageDescendants { cloudId, pageId, depth?, limit? }`.
