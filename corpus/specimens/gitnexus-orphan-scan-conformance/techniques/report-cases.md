---
metadata:
  version: 1.0.0
---

## Capability

State what the orphan-scan run landed under its positive and negative bindings.

## Inputs

### positive_orphan_candidates

Symbols in the files the graph holds that nothing references.

### negative_orphan_candidates

The rows the narrowing kept for a file no graph holds — empty by construction.

## Outputs

### orphan_scan_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-orphan-scan-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_orphan_candidates}`, the negative against `{negative_orphan_candidates}` — per [Template](/conformance/resources/case-report.md#template).
   > An empty `{negative_orphan_candidates}` is the narrowing keeping no row for a file outside the index; the row names that fallback rather than reading the file as clean.

### 2. Write the Report

- Write `{orphan_scan_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
