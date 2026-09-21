---
metadata:
  version: 1.5.0
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

### 1. Confirm the Schema

- Read `gitnexus://repo/{repo_name}/schema` first to confirm node labels and `CodeRelation.type` edge values.

### 2. Run the Query

- Call `gitnexus_cypher { query: cypher_query, repo: repo_name }`; the matching `{result_rows}` come back as the result set.
   > If the query references labels or edges not present in the schema, re-read `gitnexus://repo/{repo_name}/schema` and correct the query.
