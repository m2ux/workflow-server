---
metadata:
  version: 1.3.0
---

## Capability

Symbol blast radius — what depends on a symbol, at depth 1/2/3, with confidence and a risk level. The primary pre-edit safety check.

## Inputs

### target

the symbol name to analyse

### direction

`'upstream'` (dependents — what breaks if target changes; the work-package default) or `'downstream'` (dependencies)

### max_depth

*(optional)* How many edges out from `{target}` the traversal reaches. Three where no depth is given.

### min_confidence

*(optional)* The confidence an edge carries to be counted, such as `0.8` to keep only the edges the parser resolved exactly. Zero point seven where no floor is given.

### relation_types

*(optional)* The edge kinds the traversal walks, from `CALLS`, `IMPORTS`, `EXTENDS`, `IMPLEMENTS`, `HAS_METHOD`, `HAS_PROPERTY`, `METHOD_OVERRIDES`, `METHOD_IMPLEMENTS` and `ACCESSES`. The usage-based four — `CALLS`, `IMPORTS`, `EXTENDS`, `IMPLEMENTS` — where no set is given.

### include_tests

*(optional)* Whether the answer carries the test files that reach `{target}`. False where no value is given.

## Outputs

### impact_report

d=1 (WILL BREAK — direct callers/importers), d=2 (LIKELY AFFECTED), d=3 (MAY NEED TESTING); affected execution flows; risk level (LOW / MEDIUM / HIGH / CRITICAL); and whether the rating rests on graph edges or on a hand-derived caller set.

## Protocol

### 1. Invoke

- Call `gitnexus_impact { target, direction, maxDepth: max_depth, minConfidence: min_confidence, relationTypes: relation_types, includeTests: include_tests, repo: repo_name }`.
- If the call reports the index is out of date, run `npx gitnexus analyze` in terminal, then retry.
- If `{target}` does not resolve in the graph, verify the symbol name; if it is new or unindexed, fall back to grep for callers.

### 2. Interpret Results

- Read d=1 items first — these WILL break. Weight high-confidence (>0.8) edges.
- Derive the risk level and assemble the `{impact_report}`: <5 symbols/few processes = LOW; 5–15 symbols/2–5 processes = MEDIUM; >15 symbols or many processes = HIGH; critical path (auth, payments, consensus) = CRITICAL.
  > - When `{target}` is called from a macro body or reached by type-level reference, the graph holds no edge for it — gitnexus.edges-the-parser-cannot-see. Re-derive the caller set by hand and rate against that instead, and record on `{impact_report}` which of the two the rating rests on.
  > - A class member, an overriding method and a field read reach `{target}` through edges the default set leaves out, and a test reaches it through a file the default answer omits. Where `{target}` is one of those, name the edges in `{relation_types}` and set `{include_tests}`, so a short answer is a measurement rather than the default's silence.
