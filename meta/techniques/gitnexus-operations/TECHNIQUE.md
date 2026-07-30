---
metadata:
  version: 3.3.0
---

## Capability

Codebase intelligence via the GitNexus knowledge graph — indexing, structural queries, and graph operations.

## Rules

### query-not-grep

Apply [query](./query.md) / [context](./context.md) for execution flows and relationships. Grep is for text patterns and string literals only — when structure matters, use GitNexus.

### detect-changes-after-edit

Always apply [detect-changes](./detect-changes.md) after applying a rename or batch edits to verify only expected files were affected.

### index-freshness-first

Apply [verify-index](./verify-index.md) at the start of any GitNexus session, and again before any operation whose answer turns on the current tree — [impact](./impact.md), [detect-changes](./detect-changes.md), [orphan-scan](./orphan-scan.md), [diff-coverage-map](./diff-coverage-map.md). A stale index answers in the same shape as a fresh one and says nothing about its own age, so an unverified answer is indistinguishable from a correct one.

### graph-answers-code-not-prose

The graph holds code symbols and file paths. For a markdown tree — `workflows/`, `docs/`, `.engineering/` — it locates a file by path but cannot answer which text states a claim, and [query](./query.md) returns unrelated matches rather than an empty result, so a miss does not read as a miss. Reach for the graph by path (a [cypher](./cypher.md) `f.filePath` match) or for code structure; read the prose with grep and Read.

### keyword-shaped-queries

Phrase [query](./query.md) as keywords, not as a natural-language question. Its ranking fuses keyword and semantic scoring, and the semantic half contributes only where the index carries embeddings — which is a property of how the repo was indexed, not something the query can assert. Keyword-shaped input is the phrasing that works either way.

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations — do NOT paste raw `gitnexus_*` calls or Cypher into technique protocols; raw calls live only inside the operation procedures here. grep / Read / glob are the fallback ONLY when the codebase is not indexed or stale.
