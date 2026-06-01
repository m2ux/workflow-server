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

## Operations

| Operation | Purpose |
|---|---|
| [verify-index](./verify-index.md) | Read the GitNexus index context resource and check freshness |
| [analyze](./analyze.md) | (Re)build the GitNexus index for a repository with locking and skip-if-recent |
| [query](./query.md) | Find execution flows related to a concept or term |
| [context](./context.md) | 360-degree view of a symbol — callers, callees, and process participation |
| [impact](./impact.md) | Map upstream or downstream dependents for a symbol; assess blast radius |
| [rename](./rename.md) | Multi-file rename driven by the call graph (preview or apply) |
| [detect-changes](./detect-changes.md) | Verify the scope of recent edits — confirm only expected files/symbols changed |
| [cypher](./cypher.md) | Run a custom Cypher query over the GitNexus graph |
| [read-process](./read-process.md) | Read a process resource for a step-by-step execution trace |
| [read-cluster](./read-cluster.md) | Read a functional-area cluster resource — members and cohesion score |

## Rules

### query-not-grep

Apply [query](./query.md) / [context](./context.md) for execution flows and relationships. Grep is for text patterns and string literals only — when structure matters, use GitNexus.

### dry-run-before-rename

Always apply [rename](./rename.md) with `dry_run: true` first and review the changes with the user before applying.

### detect-changes-after-edit

Always apply [detect-changes](./detect-changes.md) after applying a rename or batch edits to verify only expected files were affected.

### index-freshness-first

Apply [verify-index](./verify-index.md) at the start of any GitNexus session. Stale indexes return misleading results.
