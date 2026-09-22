---
metadata:
  version: 1.0.0
---

## Capability

State what the doc-heading-lookup run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_tree_path

Filesystem path of the documentation tree whose headings the positive case reads.

### positive_heading_pattern

A regular expression whole headings in the tree match, so the positive case lands rows.

### positive_heading_matches

Each matching heading with the file it sits in.

### negative_tree_path

Filesystem path of the documentation tree whose headings the negative case reads.

### negative_heading_pattern

A regular expression no whole heading matches, so the negative case lands an empty set.

### negative_heading_matches

Each matching heading with the file it sits in — empty by construction.

## Outputs

### doc_heading_lookup_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-doc-heading-lookup-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_tree_path}` and `{positive_heading_pattern}` against `{positive_heading_matches}`, the negative binding `{negative_tree_path}` and `{negative_heading_pattern}` against `{negative_heading_matches}`, with `{repo_name}` as the graph the header names — per [Template](/conformance/resources/case-report.md#template).
   > An empty `{negative_heading_matches}` is the pattern matching no whole heading in a tree the graph covers; the row names that fallback rather than reading the tree as unindexed.

### 2. Write the Report

- Write `{doc_heading_lookup_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
