---
metadata:
  version: 1.0.0
---

## Capability

State what the guarded-rename run landed under its positive, negative and ambiguous-name bindings.

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

### ambiguous_name_symbol_name

A name two symbols in the graph carry, so the ambiguous-name case previews a status of ambiguous with ranked candidates.

### ambiguous_name_new_name

The name the ambiguous-name case's rename moves to.

### ambiguous_name_file_path

The file holding the symbol, which separates one of that name from the others; empty here, so the name alone is offered and the graph cannot choose between its holders.

### ambiguous_name_changes

The per-file edit list, each edit carrying the confidence its provenance earns — for a name held twice, a status of ambiguous with ranked candidates arrives in its place.

### ambiguous_name_rename_approved

Whether the previewed edit list was accepted at the gate.

### ambiguous_name_change_report

The symbols and execution flows the applied rename actually moved, read back off the diff — absent, the steps after the gate staying unreached.

## Outputs

### guarded_rename_case_report

Three rows for the one run: the bindings each case took, whether each materialised, what each landed, which fallback the negative case took, and which answer the ambiguous-name case refused at the gate.

#### artifact

`gitnexus-guarded-rename-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the three cases — the positive binding `{positive_symbol_name}`, `{positive_new_name}` and `{positive_file_path}` against `{positive_changes}`, `{positive_rename_approved}` and `{positive_change_report}`, the negative binding `{negative_symbol_name}`, `{negative_new_name}` and `{negative_file_path}` against `{negative_changes}`, `{negative_rename_approved}` and `{negative_change_report}`, and a third row named `ambiguous-name-case` for the binding `{ambiguous_name_symbol_name}`, `{ambiguous_name_new_name}` and `{ambiguous_name_file_path}` against `{ambiguous_name_changes}`, `{ambiguous_name_rename_approved}` and `{ambiguous_name_change_report}`, with `{repo_name}` as the graph the header names — per [Template](/conformance/resources/case-report.md#template).
   > An empty `{negative_changes}` for a symbol the graph does not hold, a false `{negative_rename_approved}` from the refused gate, and an absent `{negative_change_report}` because the steps after the gate did not run are together the fallback's mark; the row names that refusal rather than reading the case as a rename that moved nothing.
   > The ambiguous-name row's mark is a status of `ambiguous` with ranked candidates in `{ambiguous_name_changes}` where an edit list would be, a false `{ambiguous_name_rename_approved}` from the refused gate, and an absent `{ambiguous_name_change_report}` because nothing was written and no diff was read back; the row names the candidates the graph offered rather than reading the case as an empty list or a rename that moved nothing.

### 2. Write the Report

- Write `{guarded_rename_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
