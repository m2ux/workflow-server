---
metadata:
  version: 3.12.0
---

## Capability

Codebase intelligence via the GitNexus knowledge graph — indexing, structural queries, and graph operations across a repository and its siblings.

## Inputs

### repo_name

*(optional)* Name of the indexed graph an operation is addressed at.

## Rules

### address-a-named-graph

Every operation here answers from one indexed graph, and the caller says which by giving `{repo_name}`, omitted only where exactly one graph is indexed; where more than one is, an unnamed call fails and lists what is available. The name comes from the inventory of indexed graphs, which also carries the tree each was built from and the repository groups configured over them.

A component and a containing tree that also holds it are separate graphs whose answers differ in scope while sharing a shape. Record which graph an answer came from wherever the answer is reported.

### subjects-the-index-holds

Each operation answers from the tree its index walked, and reports on that tree rather than failing when it is addressed at something outside it. Two kinds of subject sit outside every index:

- **A document the index never walked** — a transcript, a specification under revision, a page handed over by its author. It carries no node, so an answer about it is an answer about other files whose names happen to rank.
- **Anything beneath a dot-directory** — the walk skips them, so `.github/workflows/` pipeline definitions, hooks and tool configuration are as absent from a fresh index as from a stale one.

Grep and a direct read are the whole instrument for both, as they are for prose beneath a heading per `query-not-grep`. Settle which tree holds the subject before reaching for an operation.

### query-not-grep

Execution flows and relationships among code symbols are what the graph holds, and what the operations here return — a question about either is theirs rather than grep's.

For a markdown tree the graph holds each heading and each link between files, and no prose. A question about which sentence states a claim stays a grep question, and a ranked search answers it with unrelated code matches rather than with nothing, so a miss there does not read as a miss. Grep is also for text patterns and string literals in code.

### a-change-is-scoped-by-what-it-moved

A rename or a batch of edits is scoped by what it actually moved, not by what it set out to move. The symbols and execution flows a diff lands on are read from the graph before the change is reported as contained, and the run that writes such a change reads them after it.

### index-freshness-first

A stale index answers in the same shape as a fresh one, so an answer turning on the current tree is taken against a reading of how far the graph trails it. That reading arrives as a `staleness` mapping: `branch`, `lastCommit` and `indexedAt` name the index that answered, and `status` is its standing against the HEAD of the clone it was built from — `behind` carries `commitsBehind`, `diverged` is a recorded commit the clone's history no longer holds, and `unknown` is a tree with no history to measure. A rebuild answers `behind` and `diverged`; `unknown` is unmeasurable rather than stale.

**The mapping rides only an answer that trails its tree, so its absence is the freshness verdict** — a reader waiting for a `current` status waits on a key that never comes. A direct read of the index omits the reading the same way. Three further answers carry no mapping whatever the graph's age: a raw query's rows, which arrive as a bare list; an error, which reports what failed rather than what answered; and an answer over a whole repository group, where the group's own status reports per member instead — including one failure more than age, a member carrying no graph at all, about which a group-wide answer says nothing.

### edges-the-parser-cannot-see

The graph holds the call sites the parser reads in source. Two kinds of dependency are therefore absent from a fresh index as much as a stale one, and both are common:

- **Call sites inside macro bodies.** A caller whose body a macro generates has no `CALLS` edge to what it calls, because the text that calls it exists only after expansion. In a Rust codebase built on declarative and attribute macros — pallet dispatchables, runtime-API declarations, generated trait wrappers — that removes most of the interesting edges.
- **Type-level references.** Naming a type in a signature, an associated-type binding, or a trait bound is not a call, so it is not an edge at all.

An operation's answer is therefore evidence of what the graph holds, never of what depends on the symbol. An answer states how far it vouches for itself: `epistemic` is `exact` or `lower-bound`, `causes` counts what the walk provably dropped — call sites whose receiver it could not type, files whose scope extraction failed, dispatch it could not cross, callables named as values rather than called — and a blast radius that resolved no caller is rated `UNKNOWN` rather than `LOW`. A macro-generated call site and a type-level reference leave no trace in any of those: the answer is `exact` and short. Where the changed symbol is reached through either route, re-derive the enumeration by hand — grep for the symbol, and for the macro names that generate its callers — and say which of the two a reported blast radius rests on.

### a-named-operation-answers-first

The raw graph query answers what no named operation reaches: custom call-chain traces, ordering and error-path assertions, and visibility filters. What depends on a symbol, what one symbol connects to, how one symbol reaches another, and which execution flows a concept lands in are each the subject of an operation here, whose declared output states what its answer means. A hand-written query returns rows and states nothing, so every reading such a contract carries is the author's to supply and to get right.

### keyword-shaped-queries

Phrase a ranked search as keywords, not as a natural-language question. Its ranking fuses keyword and semantic scoring, and the semantic half contributes only where the index carries embeddings — built only where the index was asked for them, and never over headings or files at any setting, so no setting gives semantic search over prose. Keyword-shaped input works either way.

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations — do NOT paste raw `gitnexus_*` calls or Cypher into technique protocols; raw calls live only inside the operation procedures here. For that analysis, grep / Read / glob are the fallback ONLY when the codebase is not indexed or stale.

Two questions fall outside this rule rather than under its fallback, and each names its own instrument: a subject no index holds (`subjects-the-index-holds`) and a question the graph cannot answer (`query-not-grep`). Grep is the first instrument for both, on a fresh index as much as a stale one.
