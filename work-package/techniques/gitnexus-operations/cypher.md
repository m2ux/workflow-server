# cypher

Raw graph query for traces and filters not covered by the higher-level operations.

## Inputs

### query

a Cypher query string

### name

repo name (usually the current repo)

## Output

### rows

the query result rows

## Procedure

1. Read `gitnexus://repo/{name}/schema` first to confirm node labels and `CodeRelation.type` edge values.
2. Call `gitnexus_cypher {query}`.
3. Reserve this for custom call-chain traces, ordering/error-path assertions, and visibility filters; prefer [impact](impact.md) / [context](context.md) / [query](query.md) when they suffice.

## Errors

### stale_index

**Cause:** the index is out of date

**Recovery:** run `npx gitnexus analyze`, then retry

### schema_mismatch

**Cause:** the query references labels/edges not in the schema

**Recovery:** re-read `gitnexus://repo/{name}/schema` and correct the query
