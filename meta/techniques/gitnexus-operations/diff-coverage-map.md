---
metadata:
  version: 1.1.0
---

## Capability

Drive test-coverage review from the actual changed-symbol set rather than project-wide heuristics.

## Inputs

### repo_name

Optional. Name of the indexed graph to address. Omit only where exactly one graph is indexed.

### diff

The working-tree / branch diff under review — source for enumerating the changed-symbol set.

## Outputs

### coverage_gaps

changed symbols with zero test callers

### update_candidates

changed symbols whose test callers are stale

## Protocol

1. Apply [detect-changes](./detect-changes.md) against `{repo_name}` to enumerate the changed-symbol set. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. For each changed symbol, apply [context](./context.md) against `{repo_name}` and inspect incoming references from test files.
3. Symbols with no test callers → `coverage-gaps`; symbols with stale test callers → `update-candidates`.
