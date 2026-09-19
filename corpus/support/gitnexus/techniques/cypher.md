---
metadata:
  version: 1.3.0
---

## Capability

Raw graph query for traces and filters not covered by the higher-level operations.

## Inputs

### cypher_query

a Cypher query string

## Outputs

### result_rows

the query result rows

## Protocol

1. Read `gitnexus://repo/{repo_name}/schema` first to confirm node labels and `CodeRelation.type` edge values.
2. Call `gitnexus_cypher { query: cypher_query, repo: repo_name }`; the matching `{result_rows}` come back as the result set.
   > - If the index is out of date, run `npx gitnexus analyze`, then retry.
   > - If the query references labels or edges not present in the schema, re-read `gitnexus://repo/{repo_name}/schema` and correct the query.

## Rules

### a-named-operation-answers-first

Reserve this for what no named operation reaches: custom call-chain traces, ordering and error-path assertions, and visibility filters. What depends on a symbol, what one symbol connects to, and which execution flows a concept lands in are each the subject of an operation — [impact](./impact.md), [context](./context.md), [query](./query.md) — whose declared output states what its answer means. A hand-written query returns rows and states nothing, so every reading those contracts carry is the author's to supply and to get right.
