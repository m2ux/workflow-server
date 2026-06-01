Find execution flows related to a concept or term.

## Inputs

### repo_name

Repository name

### search_term

Concept, error text, or keyword

## Output

### flows

Process-grouped result list ranked by relevance

## Protocol

1. Call `gitnexus query({ repo_name, search_term })`.

## Errors

### no_processes_found

**Cause:** `query()` returned no execution flows for the search term.

**Recovery:** Try broader search terms, or apply [cypher](./cypher.md) for direct graph traversal.
