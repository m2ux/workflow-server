---
metadata:
  version: 1.6.0
---

## Capability

Symbol blast radius — what depends on a symbol, at depth 1/2/3, with confidence and a risk level. The primary pre-edit safety check.

## Inputs

### target

the symbol name to analyse

### target_uid

*(optional)* The symbol identity a prior answer carried, which reaches that symbol and no other.

### symbol_kind

*(optional)* The kind of symbol meant — `Function`, `Class`, `Method`, `Interface` or `Constructor` — which separates one of that name from the others.

### direction

`'upstream'` (dependents — what breaks if `{target}` changes) or `'downstream'` (what `{target}` itself depends on)

### max_depth

*(optional)* How many edges out from `{target}` the traversal reaches, from 1 to 32.

### min_confidence

*(optional)* The confidence an edge carries to be counted, such as `0.8` to keep only the edges the parser resolved exactly.

### relation_types

*(optional)* The edge kinds the traversal walks, named from the set the graph schema declares.

### include_tests

*(optional)* Whether the answer carries the test files that reach `{target}`.

### summary_only

*(optional)* Whether the answer carries the counts, the rating, the entry points and the areas and leaves out the per-depth node list — the shape for a hub symbol whose direct callers run to hundreds.

## Outputs

### impact_report

d=1 (WILL BREAK — direct callers/importers), d=2 (LIKELY AFFECTED), d=3 (MAY NEED TESTING); the entry points whose flows the change reaches, each with the number of flows from it; a risk level; how far the answer vouches for its own completeness; and whether the rating rests on graph edges or on a hand-derived caller set.

#### risk

`LOW`, `MEDIUM`, `HIGH`, `CRITICAL` or `UNKNOWN`. An upstream walk that resolved no caller is `UNKNOWN`: the symbol is unused, or reached only through a reference the graph does not record, and the answer cannot tell which.

#### riskNote

Why the rating is withheld, present only where `risk` is `UNKNOWN`.

#### summary

The counts the rating rests on: `direct` callers, `processes_affected` — the entry points reached, not the flows behind them — and `modules_affected`, the functional areas hit.

#### byDepth

The affected nodes keyed by traversal depth as the strings `"1"`, `"2"` and `"3"`, present as far as the traversal reaches and absent where `{summary_only}` is set. Each entry carries its `depth`, `id`, `name`, `filePath`, the `relationType` it was reached by, the `confidence` that edge holds, and the `processes` it participates in. Function and file nodes both appear, the `id` prefix naming which.

#### byDepthCounts

How many nodes each depth holds in full, where `byDepth` shows a page of them.

#### affected_processes

The entry points whose flows the change reaches. Each names the entry-point symbol — its `name`, its `type`, and the `filePath` separating entries that share a name — and carries `affected_process_count`, the flows from that entry point the change reaches. The flow total is the sum of those counts rather than the length of this list.

#### affected_modules

The functional areas the change reaches, each marked direct or indirect.

#### epistemic

`exact` where the count is the whole set the graph could hold, or `lower-bound` where it is a floor — the walk provably missed callers, or a probe that would have established completeness could not run.

#### boundaries

One sentence per reason the count is short, where it is.

#### causes

What the walk dropped, each a count of missing things: `scopeExtractionFiles` files whose scope extraction failed, `receiverTyping` call sites whose receiver could not be typed, `externalBoundary` call sites that left the indexed program, `dispatchBoundary` symbols beyond an interface or injection boundary, `undecidedSatisfaction` interface pairs the analyzer never judged, and `callableValueReferences` symbols naming `{target}` as a value rather than calling it.

#### partial

Whether a pass inside the answer was cut short, in which case an empty `processes` on a node is unmeasured rather than empty.

#### staleness

Which index answered and how far it trails the HEAD of the clone it was built from — `branch`, `lastCommit`, `indexedAt`, and a `status` of `current`, `behind` (with `commitsBehind`), `diverged` or `unknown`.

## Protocol

### 1. Invoke

- Call `gitnexus_impact { target, target_uid, kind: symbol_kind, direction, maxDepth: max_depth, minConfidence: min_confidence, relationTypes: relation_types, includeTests: include_tests, summaryOnly: summary_only, repo: repo_name }`.
   > - Where several symbols carry `{target}`, the answer is the candidates rather than a report, with `totalCandidates` the true count. Choose among them and call again with that candidate's `{target_uid}`, or narrow with `{symbol_kind}`.
   > - If `{target}` does not resolve in the graph, verify the symbol name; if it is new or unindexed, fall back to grep for callers.

### 2. Interpret Results

- Read d=1 items first — these WILL break. Weight high-confidence (>0.8) edges.
- Read the rating `{impact_report}.risk` carries together with `{impact_report}.epistemic`: a `lower-bound` answer rates a floor, and `{impact_report}.causes` separates the gaps a rebuild can close — `scopeExtractionFiles`, `undecidedSatisfaction` — from the irreducible `dispatchBoundary`, while `externalBoundary` shortens nothing. An `UNKNOWN` rating is a walk that resolved no caller, and is settled by a grep for `{target}` before the symbol is treated as unused.
  > - When `{target}` is called from a macro body or reached by type-level reference, the graph holds no edge for it and `{impact_report}.epistemic` stays `exact` — gitnexus.edges-the-parser-cannot-see. Re-derive the caller set by hand and rate against that instead, and record on `{impact_report}` which of the two the rating rests on.
  > - A class member, an overriding method and a field read reach `{target}` through edges the default set leaves out, and a test reaches it through a file the default answer omits. Where `{target}` is one of those, name the edges in `{relation_types}` and set `{include_tests}`, so a short answer is a measurement rather than the default's silence.
