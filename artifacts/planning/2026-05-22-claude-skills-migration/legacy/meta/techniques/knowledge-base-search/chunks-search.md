# chunks-search

Search within a known document by its resolved path.

## Inputs

### source_path

Path returned by [catalog-search](catalog-search.md)

### query

Search query

## Procedure

1. Call `chunks_search({ source_path, query })`.

## Errors

### stale_index

**Cause:** Knowledge base has been updated since the local index was created.

**Recovery:** If chunks-search returns no results for an indexed path, fall back to [catalog-search](catalog-search.md) to rediscover.
