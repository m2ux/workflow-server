---
metadata:
  version: 1.0.0
---

## Capability

State what the doc-reference-surface run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_tree_path

Filesystem path of the documentation tree whose links the positive case reads.

### positive_target_files

A file the index records, whose referencers the positive case enumerates.

### positive_referencing_files

Per target file, the paths of the files holding a link that resolves to it.

### negative_tree_path

Filesystem path of the documentation tree whose links the negative case reads.

### negative_target_files

A path the index records no file at, so the negative case's read keeps no referencer.

### negative_referencing_files

Per target file, the paths of the files holding a link that resolves to it — empty by construction.

## Outputs

### doc_reference_surface_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-doc-reference-surface-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_tree_path}` and `{positive_target_files}` against `{positive_referencing_files}`, the negative binding `{negative_tree_path}` and `{negative_target_files}` against `{negative_referencing_files}`, with `{repo_name}` as the graph the header names — per [Template](/conformance/resources/case-report.md#template).
   > An empty `{negative_referencing_files}` for a path the index records no file at is the fallback the run promises for a file outside the index, which the run's own note says to confirm against the index before reading as no referencers; the row names that fallback rather than reading the file as unlinked.

### 2. Write the Report

- Write `{doc_reference_surface_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
