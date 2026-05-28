# broad-chunks-search

Search across documents using an indexed concept term.

## Inputs

### concept_term

Mapped concept from the index

## Procedure

1. Call `broad_chunks_search { concept: concept_term }`.

## Errors

### no_mapping_for_term

**Cause:** The local index does not contain a mapping for the search term.

**Recovery:** Use broad-chunks-search with the natural term; note the gap for future index updates.
