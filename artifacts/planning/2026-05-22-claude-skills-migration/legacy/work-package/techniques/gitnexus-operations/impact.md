# impact

Symbol blast radius — what depends on a symbol, at depth 1/2/3, with confidence and a risk level. The primary pre-edit safety check.

## Inputs

- **target** — the symbol name to analyse
- **direction** — `'upstream'` (dependents — what breaks if target changes; the work-package default) or `'downstream'` (dependencies)
- **maxDepth** — optional traversal depth (default 3)
- **minConfidence** — optional confidence floor (e.g. `0.8` to keep only high-confidence edges)

## Output

- **impact_report** — d=1 (WILL BREAK — direct callers/importers), d=2 (LIKELY AFFECTED), d=3 (MAY NEED TESTING); affected execution flows; risk level (LOW / MEDIUM / HIGH / CRITICAL)

## Procedure

1. Call `gitnexus_impact({target, direction, maxDepth, minConfidence})`.
2. Read d=1 items first — these WILL break. Weight high-confidence (>0.8) edges.
3. Derive the risk level: <5 symbols/few processes = LOW; 5–15 symbols/2–5 processes = MEDIUM; >15 symbols or many processes = HIGH; critical path (auth, payments, consensus) = CRITICAL.
4. The caller MUST surface HIGH or CRITICAL risk to the user before proceeding with an edit.

## Errors

### stale_index

**Cause:** the index is out of date

**Recovery:** run `npx gitnexus analyze` in terminal, then retry

### symbol_not_found

**Cause:** target does not resolve in the graph

**Recovery:** verify the symbol name; if it is new/unindexed, fall back to grep for callers
