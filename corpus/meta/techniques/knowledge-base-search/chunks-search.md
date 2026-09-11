---
metadata:
  version: 1.0.0
---

## Capability

Search within a known document by its resolved path.

## Inputs

### source_path

Resolved full source path of the document to search within.

### query

Search query

## Outputs

### chunk_matches

Passages of the document matching the query, one entry per match.

## Protocol

1. Call `chunks_search { source_path, query }`; return the matches as `{chunk_matches}`.
   > If this returns no results for an indexed path, the local index may be stale (the knowledge base was updated since it was created); fall back to [catalog-search](./catalog-search.md) to rediscover.
