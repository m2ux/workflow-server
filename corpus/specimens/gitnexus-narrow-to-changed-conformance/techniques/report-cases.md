---
metadata:
  version: 1.0.0
---

## Capability

State what the narrow-to-changed run landed under its positive and negative bindings.

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

## Outputs

### narrow_to_changed_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-narrow-to-changed-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_cypher_query}` over `{positive_changed_files}` against `{positive_matched_symbols}`, the negative binding `{negative_cypher_query}` over `{negative_changed_files}` against `{negative_matched_symbols}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` in the header.
   > An empty `{negative_matched_symbols}` is the path predicate keeping no row for a file outside the index; the row names that fallback rather than reading the file as one the graph holds and found without functions.

### 2. Write the Report

- Write `{narrow_to_changed_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
