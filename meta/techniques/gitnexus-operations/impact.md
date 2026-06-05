---
metadata:
  version: 1.0.0
---

## Capability

Symbol blast radius — what depends on a symbol, at depth 1/2/3, with confidence and a risk level. The primary pre-edit safety check.

## Inputs

### target

the symbol name to analyse

### direction

`'upstream'` (dependents — what breaks if target changes; the work-package default) or `'downstream'` (dependencies)

### maxDepth

optional traversal depth (default 3)

### minConfidence

optional confidence floor (e.g. `0.8` to keep only high-confidence edges)

## Output

### impact_report

d=1 (WILL BREAK — direct callers/importers), d=2 (LIKELY AFFECTED), d=3 (MAY NEED TESTING); affected execution flows; risk level (LOW / MEDIUM / HIGH / CRITICAL)

## Protocol

### 1. Invoke

- Call `gitnexus_impact {target, direction, maxDepth, minConfidence}`.
- If the call reports the index is out of date, run `npx gitnexus analyze` in terminal, then retry.
- If `target` does not resolve in the graph, verify the symbol name; if it is new or unindexed, fall back to grep for callers.

### 2. Interpret Results

- Read d=1 items first — these WILL break. Weight high-confidence (>0.8) edges.
- Derive the risk level and assemble the `impact_report`: <5 symbols/few processes = LOW; 5–15 symbols/2–5 processes = MEDIUM; >15 symbols or many processes = HIGH; critical path (auth, payments, consensus) = CRITICAL.

### 3. Act on Risk

- The caller MUST surface HIGH or CRITICAL risk to the user before proceeding with an edit.
