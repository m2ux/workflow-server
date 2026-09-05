---
metadata:
  version: 1.2.0
---

## Capability

Symbol blast radius — what depends on a symbol, at depth 1/2/3, with confidence and a risk level. The primary pre-edit safety check.

## Inputs

### repo_name

Optional. Name of the indexed graph to address. Omit only where exactly one graph is indexed.

### target

the symbol name to analyse

### direction

`'upstream'` (dependents — what breaks if target changes; the work-package default) or `'downstream'` (dependencies)

### max_depth

optional traversal depth (default 3).

### min_confidence

optional confidence floor (e.g. `0.8` to keep only high-confidence edges).

## Outputs

### impact_report

d=1 (WILL BREAK — direct callers/importers), d=2 (LIKELY AFFECTED), d=3 (MAY NEED TESTING); affected execution flows; risk level (LOW / MEDIUM / HIGH / CRITICAL); and whether the rating rests on graph edges or on a hand-derived caller set.

## Protocol

### 1. Invoke

- Call `gitnexus_impact {target, direction, max_depth, min_confidence, repo_name}`.
- If the call reports the index is out of date, run `npx gitnexus analyze` in terminal, then retry.
- If `{target}` does not resolve in the graph, verify the symbol name; if it is new or unindexed, fall back to grep for callers.

### 2. Interpret Results

- Read d=1 items first — these WILL break. Weight high-confidence (>0.8) edges.
- Derive the risk level and assemble the `{impact_report}`: <5 symbols/few processes = LOW; 5–15 symbols/2–5 processes = MEDIUM; >15 symbols or many processes = HIGH; critical path (auth, payments, consensus) = CRITICAL.
  > When `{target}` is called from a macro body or reached by type-level reference, the graph holds no edge for it — gitnexus-operations.edges-the-parser-cannot-see. Re-derive the caller set by hand and rate against that instead, and record on `{impact_report}` which of the two the rating rests on.
