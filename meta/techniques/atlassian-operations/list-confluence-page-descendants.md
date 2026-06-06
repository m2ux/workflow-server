---
metadata:
  version: 1.0.0
---

## Capability

List child pages of a Confluence page.

## Inputs

### page-id

Page ID.

### depth

Optional traversal depth

### limit

Optional result limit

## Protocol

1. Call `getConfluencePageDescendants { cloud-id, page-id, depth?, limit? }`.
