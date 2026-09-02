---
metadata:
  version: 3.7.0
---

## Capability

Codebase intelligence via the GitNexus knowledge graph — indexing, structural queries, and graph operations across a repository and its siblings.

## Rules

### address-a-named-graph

Every operation here answers from one indexed graph, and the caller says which by giving `{repo_name}`. Where more than one graph is indexed, an unnamed call fails and lists what is available — so the name costs a turn when it is left out and nothing when it is supplied. Apply [resolve-graph](./resolve-graph.md) for that name, for the graphs a sibling component is reachable under, and for the repository groups configured over them.

A component and a containing tree that also holds it are separate graphs whose answers differ in scope while sharing a shape. Record which graph an answer came from wherever the answer is reported.

### subjects-the-index-holds

Each operation answers from the tree its index walked, and reports on that tree rather than failing when it is addressed at something outside it. Two kinds of subject sit outside every index:

- **A document the index never walked** — a transcript, a specification under revision, a page handed over by its author. It carries no node, so an answer about it is an answer about other files whose names happen to rank.
- **Anything beneath a dot-directory** — the walk skips them, so `.github/workflows/` pipeline definitions, hooks and tool configuration are as absent from a fresh index as from a stale one.

Grep and a direct read are the whole instrument for both, as they are for prose beneath a heading per `query-not-grep`. Settle which tree holds the subject before reaching for an operation.

### query-not-grep

Apply [query](./query.md) / [context](./context.md) for execution flows and relationships among code symbols — that is what the graph holds, and what those two return.

For a markdown tree the graph holds each heading and each link between files, which [heading-search](./heading-search.md) and [reference-lookup](./reference-lookup.md) read. It holds no prose, so a question about which sentence states a claim stays a grep question — and [query](./query.md) answers such a question with unrelated code matches rather than with nothing, which means a miss there does not read as a miss. Grep is also for text patterns and string literals in code.

### detect-changes-after-edit

Always apply [detect-changes](./detect-changes.md) after applying a rename or batch edits to verify only expected files were affected.

### index-freshness-first

Apply [verify-index](./verify-index.md) at the start of any GitNexus session, and again before any operation whose answer turns on the current tree — [impact](./impact.md), [detect-changes](./detect-changes.md), [orphan-scan](./orphan-scan.md), [diff-coverage-map](./diff-coverage-map.md). A stale index answers in the same shape as a fresh one and says nothing about its own age, so an unverified answer is indistinguishable from a correct one.

[group-freshness](./group-freshness.md) is the same check for an answer drawn from a whole repository group, and it reads one failure more than age — which it states.

### edges-the-parser-cannot-see

The graph holds the call sites the parser reads in source. Two kinds of dependency are therefore absent from a fresh index as much as a stale one, and both are common:

- **Call sites inside macro bodies.** A caller whose body a macro generates has no `CALLS` edge to what it calls, because the text that calls it exists only after expansion. In a Rust codebase built on declarative and attribute macros — pallet dispatchables, runtime-API declarations, generated trait wrappers — that removes most of the interesting edges.
- **Type-level references.** Naming a type in a signature, an associated-type binding, or a trait bound is not a call, so it is not an edge at all.

An operation's answer is therefore evidence of what the graph holds, never of what depends on the symbol. Where the changed symbol is reached through either route, a `LOW` risk level or an empty caller set is absence of evidence, and the enumeration is re-derived by hand — grep for the symbol, and for the macro names that generate its callers. Say which of the two was done when reporting a blast radius, so a reader can tell a measured answer from an unmeasured one.

### keyword-shaped-queries

Phrase [query](./query.md) as keywords, not as a natural-language question. Its ranking fuses keyword and semantic scoring, and the semantic half contributes only where the index carries embeddings. Embeddings are built only where the index was asked for them, which is why a repository commonly reports none; and headings and files are never embedded at any setting, so no setting gives semantic search over prose. Keyword-shaped input is the phrasing that works either way.

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations — do NOT paste raw `gitnexus_*` calls or Cypher into technique protocols; raw calls live only inside the operation procedures here. grep / Read / glob are the fallback ONLY when the codebase is not indexed or stale.
