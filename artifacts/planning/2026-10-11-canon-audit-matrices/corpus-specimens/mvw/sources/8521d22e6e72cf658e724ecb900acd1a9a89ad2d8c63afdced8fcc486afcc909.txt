---
metadata:
  version: 1.0.0
---

## Capability

Compose the graph query that keeps, from a `MATCH` the caller already wrote, only the rows whose file is among the files this work changed.

## Inputs

### cypher_query

A Cypher query that returns `symbol_name` and `file_path`. Each arm of a `UNION ALL` is its own `MATCH`.

### changed_files

The files the change under review touches.

## Outputs

### cypher_query

The same query with each `MATCH` restricted to `{changed_files}`.

## Protocol

### 1. Add the Path Predicate

- On each `MATCH` in `{cypher_query}`, add a `filePath` predicate on the node whose path that arm returns as `file_path`. A `MATCH` that already has a `WHERE` takes `AND <alias>.filePath IN [...]`; one that does not takes `WHERE <alias>.filePath IN [...]`. The list is each path of `{changed_files}`, quoted as a Cypher string.
   > A `UNION ALL` is several arms, and each arm carries the predicate — wrapping the whole query as a subquery is the other shape when the dialect can wrap `UNION ALL`, and either shape is the query the graph will run.
- Record the resulting string as `{cypher_query}`.
