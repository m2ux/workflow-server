# diff-coverage-map

Drive test-coverage review from the actual changed-symbol set rather than project-wide heuristics. (review-test-suite)

## Output

- **coverage_gaps** — changed symbols with zero test callers
- **update_candidates** — changed symbols whose test callers are stale

## Procedure

- Run [detect-changes](detect-changes.md) to enumerate the changed-symbol set.
- For each changed symbol, run [context](context.md) and inspect incoming references from test files.
- Symbols with no test callers → coverage_gaps; symbols with stale test callers → update_candidates.

## Tools

- **mcp:** gitnexus

## Errors

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
