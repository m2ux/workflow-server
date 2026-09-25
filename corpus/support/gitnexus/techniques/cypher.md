---
metadata:
  version: 1.8.0
---

## Capability

Raw graph query for traces and filters not covered by the higher-level techniques.

## Inputs

### cypher_query

a Cypher query string

### query_params

*(optional)* Values for the `$name` placeholders the statement carries, keyed by placeholder name and bound as a prepared statement.

## Outputs

### result_rows

The matching rows as a markdown table, one per match, with `row_count` stating how many. An empty match returns a bare list with no `row_count`, and no answer here carries `staleness`.

## Protocol

### 1. Confirm the Schema

- Read `gitnexus://repo/{repo_name}/schema` first to confirm node labels and `CodeRelation.type` edge values.
   > The schema lists every property the parser can record, a wider set than any one graph holds; a property the graph lacks fails the whole statement with a binder error naming it.

### 2. Run the Query

- Call `gitnexus_cypher { statement: cypher_query, params: query_params, repo: repo_name }`; the matching `{result_rows}` come back as the result set.
   > - If the query references labels or edges not present in the schema, re-read `gitnexus://repo/{repo_name}/schema` and correct the query.
   > - A `startLine` or `endLine` a row carries is zero-based, where the named techniques report the same symbol one-based: the symbol spans editor lines `startLine + 1` to `endLine + 1`.
   > - A path over `CDG`, `REACHING_DEF`, `TAINTED` or `TAINT_PATH` edges is unindexed on its relationship properties, so a scan not anchored on a file or a symbol span, and not bounded by `LIMIT`, runs without bound. Those edges hold rows only on a graph built with its program-dependence layers.

### 3. Read the Result Set

- Read an absent `row_count` as zero, and take the graph's age from an answer that reports it or a direct index read.
