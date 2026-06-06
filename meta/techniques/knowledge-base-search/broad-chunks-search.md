---
metadata:
  version: 1.0.0
---

## Capability

Search across documents using an indexed concept term.

## Inputs

### concept-term

Mapped concept from the index.

## Protocol

1. Call `broad_chunks_search { concept: concept-term }`.
   - If the local index has no mapping for the search term, retry broad-chunks-search with the natural term and note the gap for future index updates.
