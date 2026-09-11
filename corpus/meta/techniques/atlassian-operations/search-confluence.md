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

## Outputs

### confluence_results

Content matching the query, one entry per result.

## Protocol

1. Call `searchConfluenceUsingCql { cloudId, cql, limit?, cursor? }`; return the matches as `{confluence_results}`.
