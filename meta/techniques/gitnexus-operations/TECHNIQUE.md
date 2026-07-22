---
metadata:
  version: 3.2.0
---

## Capability

Codebase intelligence via the GitNexus knowledge graph — indexing, structural queries, and graph operations.

## Rules

### query-not-grep

Apply [query](./query.md) / [context](./context.md) for execution flows and relationships. Grep is for text patterns and string literals only — when structure matters, use GitNexus.

### detect-changes-after-edit

Always apply [detect-changes](./detect-changes.md) after applying a rename or batch edits to verify only expected files were affected.

### index-freshness-first

Apply [verify-index](./verify-index.md) at the start of any GitNexus session. Stale indexes return misleading results.

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations — do NOT paste raw `gitnexus_*` calls or Cypher into technique protocols; raw calls live only inside the operation procedures here. grep / Read / glob are the fallback ONLY when the codebase is not indexed or stale.
