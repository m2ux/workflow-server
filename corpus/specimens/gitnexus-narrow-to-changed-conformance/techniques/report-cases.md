---
metadata:
  version: 1.0.0
---

## Capability

State what the narrow-to-changed run landed under its positive, negative and union bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_cypher_query

A query for every function's name and file, which the positive case's path predicate narrows.

### positive_changed_files

A file the graph holds, whose functions the positive case's predicate keeps.

### positive_matched_symbols

Rows of the query that sit in the file the graph holds, each with the symbol and the file the graph records.

### negative_cypher_query

The same query for every function's name and file, which the negative case's path predicate narrows.

### negative_changed_files

A file no graph holds, so the negative case's predicate keeps no row.

### negative_matched_symbols

Rows of the query that sit in a file no graph holds — empty by construction.

### union_cypher_query

A two-arm `UNION ALL` query, one arm for every function and one for every method, each returning the symbol's name and file, so the union case's path predicate rides each arm.

### union_changed_files

Two files the graph holds, whose functions and methods the union case's predicate keeps.

### union_matched_symbols

Rows of the query that sit in the two files the graph holds — functions from one arm and methods from the other, each with the symbol and the file the graph records.

## Outputs

### narrow_to_changed_case_report

Three rows for the one run: the bindings each case took, whether each materialised, what each landed, which fallback the negative case took, and which query shape the union case landed.

#### artifact

`gitnexus-narrow-to-changed-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the three cases — the positive binding `{positive_cypher_query}` over `{positive_changed_files}` against `{positive_matched_symbols}`, the negative binding `{negative_cypher_query}` over `{negative_changed_files}` against `{negative_matched_symbols}`, and a third row named `union-case` binding `{union_cypher_query}` over `{union_changed_files}` against `{union_matched_symbols}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` in the header.
   > An empty `{negative_matched_symbols}` is the path predicate keeping no row for a file outside the index; the row names that fallback rather than reading the file as one the graph holds and found without functions.
   > The union row's mark is the two-arm shape: each arm of the `UNION ALL` in `{union_cypher_query}` carries its own path predicate, so `{union_matched_symbols}` holds functions from the first arm and methods from the second, drawn from both files in `{union_changed_files}` and from nothing outside them. The row names the shape and the two kinds of row, so a predicate riding two arms reads apart from the positive row's predicate on one.

### 2. Write the Report

- Write `{narrow_to_changed_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
