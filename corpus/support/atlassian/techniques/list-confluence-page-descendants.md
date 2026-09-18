---
metadata:
  version: 1.0.0
---

## Capability

List child pages of a Confluence page.

## Inputs

### pageId

Page ID.

### depth

Optional traversal depth

### limit

Optional result limit

## Outputs

### child_pages

The page's descendants, one entry per child page.

## Protocol

1. Call `getConfluencePageDescendants { cloudId, pageId, depth?, limit? }`; return the listing as `{child_pages}`.
