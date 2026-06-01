---
name: gitnexus-operations
description: Foundational operations for codebase queries via the GitNexus knowledge graph — index lifecycle, structural queries, and graph traversals.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.2.0
  order: 6
  legacy_id: 6
---

# Gitnexus Operations

## Capability

Operations for codebase queries via the GitNexus knowledge graph — index management (verify, analyze), structural queries (query, context, impact, detect-changes), graph operations (cypher, rename), and resource reads (process, cluster traces).

## Rules

### query-not-grep

Apply [query](./query.md) / [context](./context.md) for execution flows and relationships. Grep is for text patterns and string literals only — when structure matters, use GitNexus.

### dry-run-before-rename

Always apply [rename](./rename.md) with `dry_run: true` first and review the changes with the user before applying.

### detect-changes-after-edit

Always apply [detect-changes](./detect-changes.md) after applying a rename or batch edits to verify only expected files were affected.

### index-freshness-first

Apply [verify-index](./verify-index.md) at the start of any GitNexus session. Stale indexes return misleading results.
