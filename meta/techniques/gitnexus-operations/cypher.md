---
metadata:
  version: 1.1.0
---

## Capability

Raw graph query for traces and filters not covered by the higher-level operations.

## Inputs

### repo_name

Optional. Name of the indexed graph to address, as [resolve-graph](./resolve-graph.md) reports it. Omit only where exactly one graph is indexed.

### cypher_query

a Cypher query string

## Outputs

### result_rows

the query result rows

## Protocol

1. Read `gitnexus://repo/{repo_name}/schema` first to confirm node labels and `CodeRelation.type` edge values.
2. Call `gitnexus_cypher {cypher_query, repo_name}`; the matching `{result_rows}` come back as the result set.
   > - If the index is out of date, run `npx gitnexus analyze`, then retry.
   > - If the query references labels or edges not present in the schema, re-read `gitnexus://repo/{repo_name}/schema` and correct the query.
3. Reserve this for custom call-chain traces, ordering/error-path assertions, and visibility filters; prefer [impact](./impact.md) / [context](./context.md) / [query](./query.md) when they suffice.
