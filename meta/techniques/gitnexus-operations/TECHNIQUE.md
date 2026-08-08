---
metadata:
  version: 3.4.0
---

## Capability

Codebase intelligence via the GitNexus knowledge graph — indexing, structural queries, and graph operations.

## Rules

### query-not-grep

Apply [query](./query.md) / [context](./context.md) for execution flows and relationships among code symbols — that is what the graph holds. For a markdown tree it holds paths and no prose, so a question about which text states a claim is a grep question, and [query](./query.md) answers it with unrelated matches rather than nothing, which means a miss there does not read as a miss. Grep is also for text patterns and string literals in code.

### detect-changes-after-edit

Always apply [detect-changes](./detect-changes.md) after applying a rename or batch edits to verify only expected files were affected.

### index-freshness-first

Apply [verify-index](./verify-index.md) at the start of any GitNexus session, and again before any operation whose answer turns on the current tree — [impact](./impact.md), [detect-changes](./detect-changes.md), [orphan-scan](./orphan-scan.md), [diff-coverage-map](./diff-coverage-map.md). A stale index answers in the same shape as a fresh one and says nothing about its own age, so an unverified answer is indistinguishable from a correct one.

### edges-the-parser-cannot-see

The graph holds the call sites the parser reads in source. Two kinds of dependency are therefore absent from a fresh index as much as a stale one, and both are common:

- **Call sites inside macro bodies.** A caller whose body a macro generates has no `CALLS` edge to what it calls, because the text that calls it exists only after expansion. In a Rust codebase built on declarative and attribute macros — pallet dispatchables, runtime-API declarations, generated trait wrappers — that removes most of the interesting edges.
- **Type-level references.** Naming a type in a signature, an associated-type binding, or a trait bound is not a call, so it is not an edge at all.

An operation's answer is therefore evidence of what the graph holds, never of what depends on the symbol. Where the changed symbol is reached through either route, a `LOW` risk level or an empty caller set is absence of evidence, and the enumeration is re-derived by hand — grep for the symbol, and for the macro names that generate its callers. Say which of the two was done when reporting a blast radius, so a reader can tell a measured answer from an unmeasured one.

### keyword-shaped-queries

Phrase [query](./query.md) as keywords, not as a natural-language question. Its ranking fuses keyword and semantic scoring, and the semantic half contributes only where the index carries embeddings — which is a property of how the repo was indexed, not something the query can assert. Keyword-shaped input is the phrasing that works either way.

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations — do NOT paste raw `gitnexus_*` calls or Cypher into technique protocols; raw calls live only inside the operation procedures here. grep / Read / glob are the fallback ONLY when the codebase is not indexed or stale.
