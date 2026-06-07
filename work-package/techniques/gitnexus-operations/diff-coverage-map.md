---
metadata:
  version: 1.0.0
---

## Capability

Drive test-coverage review from the actual changed-symbol set rather than project-wide heuristics. (review-test-suite)

## Output

### coverage_gaps

changed symbols with zero test callers

### update_candidates

changed symbols whose test callers are stale

## Protocol

1. Apply [detect-changes](../../../meta/techniques/gitnexus-operations/detect-changes.md) to enumerate the changed-symbol set. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. For each changed symbol, apply [context](../../../meta/techniques/gitnexus-operations/context.md) and inspect incoming references from test files.
3. Symbols with no test callers → `coverage-gaps`; symbols with stale test callers → `update-candidates`.
