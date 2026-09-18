---
metadata:
  version: 1.0.1
---

## Capability

Search across documents using an indexed concept term.

## Inputs

### concept_term

Mapped concept from the index.

## Outputs

### chunk_matches

Passages matching the concept across documents, one entry per match.

## Protocol

### 1. Search Across Documents

- Call `broad_chunks_search { concept: concept_term }`; return the matches as `{chunk_matches}`.
  > If the local index has no mapping for the search term, retry broad-chunks-search with the natural term and note the gap for future index updates.