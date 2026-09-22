---
metadata:
  version: 1.0.0
---

## Capability

State what the guarded-rename run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_symbol_name

A symbol the graph holds, so the positive case previews an edit list with rows.

### positive_new_name

The name the positive case's rename moves to.

### positive_file_path

The file holding the symbol, which separates one of that name from the others; empty where the name alone is enough.

### positive_changes

The per-file edit list, each edit carrying the confidence its provenance earns.

### positive_rename_approved

Whether the previewed edit list was accepted at the gate.

### positive_change_report

The symbols and execution flows the applied rename actually moved, read back off the diff.

### negative_symbol_name

A symbol the graph does not hold, so the negative case previews an empty edit list.

### negative_new_name

The name the negative case's rename moves to.

### negative_file_path

The file holding the symbol, which separates one of that name from the others; empty where the name alone is enough.

### negative_changes

The per-file edit list, each edit carrying the confidence its provenance earns — empty by construction.

### negative_rename_approved

Whether the previewed edit list was accepted at the gate.

### negative_change_report

The symbols and execution flows the applied rename actually moved, read back off the diff — absent, the steps after the gate staying unreached.

## Outputs

### guarded_rename_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-guarded-rename-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_symbol_name}`, `{positive_new_name}` and `{positive_file_path}` against `{positive_changes}`, `{positive_rename_approved}` and `{positive_change_report}`, the negative binding `{negative_symbol_name}`, `{negative_new_name}` and `{negative_file_path}` against `{negative_changes}`, `{negative_rename_approved}` and `{negative_change_report}`, with `{repo_name}` as the graph the header names — per [Template](/conformance/resources/case-report.md#template).
   > An empty `{negative_changes}` for a symbol the graph does not hold, a false `{negative_rename_approved}` from the refused gate, and an absent `{negative_change_report}` because the steps after the gate did not run are together the fallback's mark; the row names that refusal rather than reading the case as a rename that moved nothing.

### 2. Write the Report

- Write `{guarded_rename_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
