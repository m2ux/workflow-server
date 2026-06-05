---
metadata:
  version: 1.0.0
---

## Capability

Read the matching domain index file from `.engineering/resources/`.

## Inputs

### domain

Domain hint (e.g., `substrate`, `blockchain`)

## Output

### index

Parsed source registry, concept lookup table, and topic clusters

## Protocol

1. Locate `{domain}-knowledge-index.md` under `.engineering/resources/`.
2. Read the file and parse its source registry, concept table, and topic clusters into the `index`.

## Errors

### no_index_for_domain

**Cause:** No knowledge-index file found in `.engineering/resources/` for the requested domain.

**Recovery:** Fall back to standard concept-rag search: apply [catalog-search](./catalog-search.md) then [chunks-search](./chunks-search.md).
