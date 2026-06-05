---
metadata:
  version: 1.0.0
---

## Capability

Raw graph query for traces and filters not covered by the higher-level operations.

## Inputs

### query

a Cypher query string

### name

repo name (usually the current repo)

## Output

### rows

the query result rows

## Protocol

1. Read `gitnexus://repo/{name}/schema` first to confirm node labels and `CodeRelation.type` edge values.
2. Call `gitnexus_cypher {query}`; the matching `rows` come back as the result set.
   - If the index is out of date, run `npx gitnexus analyze`, then retry.
   - If the query references labels or edges not present in the schema, re-read `gitnexus://repo/{name}/schema` and correct the query.
3. Reserve this for custom call-chain traces, ordering/error-path assertions, and visibility filters; prefer [impact](./impact.md) / [context](./context.md) / [query](./query.md) when they suffice.
