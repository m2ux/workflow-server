Search within a known document by its resolved path.

## Inputs

### source_path

Resolved full source path of the document to search within

### query

Search query

## Protocol

1. Call `chunks_search { source_path, query }`.

## Errors

### stale_index

**Cause:** Knowledge base has been updated since the local index was created.

**Recovery:** If chunks-search returns no results for an indexed path, fall back to [catalog-search](./catalog-search.md) to rediscover.
