---
metadata:
  version: 1.0.0
---

## Capability

The shortest directed path from one symbol to another over call and class-member edges — how A reaches B, in one answer.

## Inputs

### from_symbol

The symbol the path starts at.

### to_symbol

The symbol the path ends at.

### from_uid

*(optional)* The starting symbol's identity a prior answer carried, which reaches that symbol and no other.

### to_uid

*(optional)* The ending symbol's identity a prior answer carried, which reaches that symbol and no other.

### from_file

*(optional)* The file holding the starting symbol, which separates one of that name from the others.

### to_file

*(optional)* The file holding the ending symbol, which separates one of that name from the others.

### max_depth

*(optional)* The longest path the search follows, in hops, from 1 to 30.

#### default

`10`

### include_tests

*(optional)* Whether the path may pass through symbols in test files.

## Outputs

### trace_report

The path found, or where the search stopped short of one.

#### status

`ok` where a path was found, `no_path` where the search exhausted what it could reach, `ambiguous` where a name resolved to several symbols, `not_found` where a name resolved to none, or `error`.

#### hops

The symbols on the path in order, each with its `name`, `filePath` and `startLine`.

#### edges

One entry per step between consecutive hops, aligned with `hops`, carrying the `relType` walked — `CALLS`, or `HAS_METHOD` where the path descends from a class into its method — and the `confidence` that edge holds.

#### hopCount

How many edges the path takes.

#### furthest

Where the search stopped when no path was found — the reachable node furthest from `{from_symbol}`, with its depth — so the break in the chain is named.

#### truncated

Whether a traversal cap stopped the search before it exhausted the graph, in which case `no_path` is a bound and not a verdict.

## Protocol

### 1. Trace the Path

- Call `gitnexus_trace { from: from_symbol, to: to_symbol, from_uid, to_uid, from_file, to_file, maxDepth: max_depth, includeTests: include_tests, repo: repo_name }` and record the `{trace_report}`.
   > - Where a name resolves to several symbols the answer's `status` is `ambiguous`, with ranked candidates and the `role` naming which end. Choose the one meant and call again with its identity in `{from_uid}` or `{to_uid}`, or name its file.
   > - A path's edges are the parser's; a hop through a macro-generated call site or a type-level reference does not exist to be walked — gitnexus.edges-the-parser-cannot-see — so a `no_path` over such code says where the graph ends rather than where the call chain does.

### 2. Read a Missing Path

- Read `{trace_report}.furthest` on a `no_path` answer as where the chain breaks: the boundary is a dispatch the graph cannot cross, an external call, or a cap where `{trace_report}.truncated` is set, and a longer `{max_depth}` re-asks only the last of those.
