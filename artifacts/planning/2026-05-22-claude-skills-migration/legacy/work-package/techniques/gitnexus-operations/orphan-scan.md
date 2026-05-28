# orphan-scan

Find functions with zero in-degree CALLS edges (orphan/unused symbols) and intersect them with the changed-file set to surface introduced-but-unreferenced symbols as over-engineering candidates. Beats grep heuristics. (review-strategy)

## Inputs

- **changed_files** — the set of files changed by the work package (from [detect-changes](detect-changes.md))

## Output

- **orphan_candidates** — symbols in changed_files with no callers — over-engineering / dead-code candidates

## Procedure

- Run [cypher](cypher.md) with `MATCH (f:Function) WHERE NOT (()-[:CodeRelation {type: 'CALLS'}]->(f)) RETURN f.name, f.filePath`.
- Intersect the orphan set with changed_files so only symbols *introduced or touched by this work* are surfaced.
- Report the intersection as over-engineering candidates for user decision.

## Tools

- **mcp:** gitnexus

## Errors

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
