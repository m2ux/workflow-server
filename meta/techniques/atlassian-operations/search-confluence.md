---
metadata:
  version: 1.0.0
---

## Capability

Search Confluence content with CQL.

## Inputs

### cql

CQL query string

### limit

Optional result limit

## Protocol

1. Call `searchConfluenceUsingCql { cloudId, cql, limit?, cursor? }`.
