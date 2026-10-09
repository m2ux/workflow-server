---
metadata:
  version: 2.0.0
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

The matching rows as a markdown table, one per match, with `row_count` stating how many. An empty match returns a bare list carrying neither `row_count` nor `staleness`.

## Protocol

### 1. Confirm the Schema

- Call `gitnexus_cypher { statement: "CALL show_tables() RETURN name, type", repo: repo_name }` for the node and relationship tables the graph holds, and `gitnexus_cypher { statement: "MATCH ()-[r:CodeRelation]->() RETURN DISTINCT r.type AS edge_type ORDER BY edge_type", repo: repo_name }` for the `CodeRelation.type` edge values it holds.
   > `show_tables()` lists the tables the graph was created with — every label the parser can record, a wider set than any one tree populates, so a label there may hold no node. The edge enumeration is the opposite: it reads the edges this graph holds, so a value absent from it is a value nothing in this tree carries. A label's properties come from `CALL table_info('<label>') RETURN name`, narrowed to what this graph records for that label, and a property it does not list fails the whole statement with a binder error naming it.

### 2. Run the Query

- Call `gitnexus_cypher { statement: cypher_query, params: query_params, repo: repo_name }`; the matching `{result_rows}` come back as the result set.
   > - Where the query references labels or edges the enumerations above do not hold, re-run them and correct the query.
   > - A `startLine` or `endLine` a row carries is zero-based, where the named techniques report the same symbol one-based: the symbol spans editor lines `startLine + 1` to `endLine + 1`.
   > - A path over `CDG`, `REACHING_DEF`, `TAINTED` or `TAINT_PATH` edges is unindexed on its relationship properties, so a scan not anchored on a file or a symbol span, and not bounded by `LIMIT`, runs without bound. Those edges hold rows only on a graph built with its program-dependence layers.

### 3. Read the Result Set

- Read an absent `row_count` as zero, and read the `staleness` mapping a matching answer carries as the graph's age. An empty match carries neither, so an emptiness is the one answer here that states nothing about how old the graph it came from is.
