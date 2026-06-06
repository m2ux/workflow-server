---
metadata:
  version: 1.0.0
---

## Capability

List child pages of a Confluence page.

## Inputs

### pageId

Page ID

### depth

Optional traversal depth

### limit

Optional result limit

## Protocol

1. Call `getConfluencePageDescendants { cloudId, pageId, depth?, limit? }`.
