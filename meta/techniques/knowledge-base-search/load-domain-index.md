---
metadata:
  version: 1.0.0
---

## Capability

Read the matching domain index file from `.engineering/resources/`.

## Inputs

### domain_name

Domain hint (e.g., `substrate`, `blockchain`)

## Outputs

### domain_index

Parsed source registry, concept lookup table, and topic clusters

## Protocol

1. Locate `{domain_name}-knowledge-index.md` under `.engineering/resources/`.
   - If no knowledge-index file is found there for the requested `{domain_name}`, fall back to standard concept-rag search: apply [catalog-search](./catalog-search.md) then [chunks-search](./chunks-search.md).
2. Read the file and parse its source registry, concept table, and topic clusters into the `{domain_index}`.
