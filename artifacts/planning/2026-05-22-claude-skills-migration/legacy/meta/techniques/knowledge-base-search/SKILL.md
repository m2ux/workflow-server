---
name: knowledge-base-search
description: Targeted concept-rag searches via pre-indexed domain maps.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 4
  legacy_id: 4
---

# Knowledge Base Search

## Capability

Operations for targeted concept-rag searches via pre-indexed domain maps.

## Operations

| Operation | Purpose |
|---|---|
| [load-domain-index](load-domain-index.md) | Read the matching domain-knowledge-index file from `.engineering/resources/` |
| [catalog-search](catalog-search.md) | Resolve a document name to its full source path |
| [chunks-search](chunks-search.md) | Search within a known document by its resolved path |
| [broad-chunks-search](broad-chunks-search.md) | Search across documents using an indexed concept term |
