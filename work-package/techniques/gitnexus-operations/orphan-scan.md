---
metadata:
  version: 1.0.0
---

## Capability

Find functions with zero in-degree CALLS edges (orphan/unused symbols) and intersect them with the changed-file set to surface introduced-but-unreferenced symbols as over-engineering candidates. Beats grep heuristics. (review-strategy)

## Inputs

### changed-files

the set of files changed by the work package

## Output

### orphan-candidates

symbols in changed-files with no callers — over-engineering / dead-code candidates

## Protocol

1. Apply [cypher](../../../meta/techniques/gitnexus-operations/cypher.md) with `MATCH (f:Function) WHERE NOT (()-[:CodeRelation {type: 'CALLS'}]->(f)) RETURN f.name, f.filePath`. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. Intersect the orphan set with {changed-files} so only symbols *introduced or touched by this work* are surfaced.
3. Report the intersection as {orphan-candidates} — over-engineering / dead-code candidates surfaced for user decision.
