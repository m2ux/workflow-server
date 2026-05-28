# search-confluence

Search Confluence content with CQL.

## Inputs

### cloudId

From [resolve-cloud-id](resolve-cloud-id.md)

### cql

CQL query string

### limit

Optional result limit

## Procedure

1. Call `searchConfluenceUsingCql({ cloudId, cql, limit?, cursor? })`.
