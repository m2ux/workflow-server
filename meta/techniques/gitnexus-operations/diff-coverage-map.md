---
metadata:
  version: 1.0.0
---

## Capability

Drive test-coverage review from the actual changed-symbol set rather than project-wide heuristics.

## Inputs

### repo_name

Name of the indexed repository whose graph the operations query (the `{name}` in `gitnexus://repo/{name}/context`). Index freshness is confirmed via this name before the first operation.

### diff

The working-tree / branch diff under review, consumed by [detect-changes](./detect-changes.md) to enumerate the changed-symbol set.

## Output

### coverage_gaps

changed symbols with zero test callers

### update_candidates

changed symbols whose test callers are stale

## Protocol

1. Apply [detect-changes](./detect-changes.md) to enumerate the changed-symbol set. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. For each changed symbol, apply [context](./context.md) and inspect incoming references from test files.
3. Symbols with no test callers → `coverage-gaps`; symbols with stale test callers → `update-candidates`.
