---
metadata:
  version: 1.7.0
---

## Capability

360-degree view of one symbol — callers, callees, and the execution flows it participates in.

## Inputs

### name

the symbol to inspect

### file_path

*(optional)* The file holding the symbol, which separates one of that name from the others.

### symbol_uid

*(optional)* The symbol identity a prior answer carried, which reaches that symbol and no other.

### symbol_kind

*(optional)* The kind of symbol meant — `Function`, `Class`, `Method`, `Interface` or `Constructor` — which separates one of that name from the others where the file does not.

### chain_depth

*(optional)* How many `CALLS` hops out from the symbol the answer walks, from 0 to 3. Zero carries no chain.

## Outputs

### context_report

incoming calls (callers), outgoing calls (callees), process membership with step positions, and how far the incoming set can be trusted as complete

#### incoming

The references reaching the symbol, grouped by the kind of edge each carries. A field access carries a `reason` of `read` or `write`.

#### outgoing

The references the symbol makes, grouped the same way.

#### processes

The execution flows the symbol participates in, each named by its `name` rather than by the `summary` a ranked query uses.

##### id

The flow's graph identifier.

##### name

What names the flow end to end.

##### step_index

The symbol's position within the flow.

##### step_count

How many steps the flow runs.

#### routes

The HTTP endpoints the symbol handles, each as a `url` and a `method`, present where the graph joins it to a route.

#### is_entry_point

Whether the symbol is the entry of an execution flow, present and true where it is.

#### chain

The symbol's callers and callees layered by depth, present where `{chain_depth}` is above zero.

#### epistemic

`exact` where `incoming` is the whole set the graph could hold, or `lower-bound` where it is a floor — the walk provably missed callers, or a probe that would have established completeness could not run.

#### boundaries

One sentence per reason the incoming set is short, where it is.

#### causes

What the walk dropped, each a count of missing things: `scopeExtractionFiles` files whose scope extraction failed, `receiverTyping` call sites whose receiver could not be typed, `externalBoundary` call sites that left the indexed program, `dispatchBoundary` symbols beyond an interface or injection boundary, `undecidedSatisfaction` interface pairs the analyzer never judged, and `callableValueReferences` symbols naming this one as a value rather than calling it.

#### staleness

The freshness reading `an-absent-staleness-mapping-is-the-verdict` describes, carried only where the graph trails its tree.

## Protocol

### 1. Assemble the Context Report

- Call `gitnexus_context { name, file_path, uid: symbol_uid, kind: symbol_kind, chain_depth, repo: repo_name }` to assemble the `{context_report}` — incoming calls, outgoing calls, and process membership.
   > - Where several symbols carry `{name}`, the answer is the candidates rather than a report, with `totalCandidates` the true count and `candidatesTruncated` set where the list shown is shorter. Choose among them by the file each sits in and call again with that candidate's `{symbol_uid}`, or with `{symbol_kind}` where the answer carries no identity.
   > - `{file_path}` separates symbols in different files and nothing else: a file and its headings share one path, so naming it leaves those candidates standing. `{symbol_uid}` reaches one of them; `{symbol_kind}` asks for the file rather than its headings.
   > - Where `{name}` resolves to nothing the answer is an error naming it, carrying no `status` and no report to read a field from. Grep for the symbol: it is unindexed, and the tree the index walked is what `subjects-the-index-holds` bounds.

### 2. Read the Fan-Out as Blast Radius

- Read `{context_report}.epistemic` before the fan-out: a `lower-bound` incoming set is a floor, and `{context_report}.causes` separates the gaps a rebuild can close — `scopeExtractionFiles`, `undecidedSatisfaction` — from the irreducible `dispatchBoundary`; `externalBoundary` counts calls leaving the indexed program and shortens nothing.
- Read the `{context_report}`'s caller fan-out as a blast-radius signal: many callers and broad process participation → the symbol is path-committing; an isolated symbol with an `exact` incoming set is low-risk to touch.
