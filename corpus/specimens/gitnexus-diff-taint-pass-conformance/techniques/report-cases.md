---
metadata:
  version: 1.0.0
---

## Capability

State what the diff-taint-pass run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_introduced_flows

Findings with a hop on a symbol the change moved, each naming that symbol.

### positive_inherited_flows

Findings anchored at a changed symbol whose every hop sits outside the change.

### positive_taint_unmeasured

Whether the graph carried no taint layer, so the partition settles nothing.

### negative_introduced_flows

Findings with a hop on a symbol the change moved, each naming that symbol.

### negative_inherited_flows

Findings anchored at a changed symbol whose every hop sits outside the change.

### negative_taint_unmeasured

Whether the graph carried no taint layer, so the partition settles nothing.

## Outputs

### diff_taint_pass_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-diff-taint-pass-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases under the graph `{repo_name}` names — the positive against `{positive_introduced_flows}`, `{positive_inherited_flows}` and `{positive_taint_unmeasured}`, the negative against `{negative_introduced_flows}`, `{negative_inherited_flows}` and `{negative_taint_unmeasured}` — per [Template](/conformance/resources/case-report.md#template).
   > An empty `{negative_introduced_flows}` beside an empty `{negative_inherited_flows}` with `{negative_taint_unmeasured}` false is an empty change set — nothing staged, so the per-symbol pass ran zero times and no layer read was attempted; the row names that fallback rather than reading the change as partitioned and clean, and rather than reading the layer as absent, which only a true flag says.

### 2. Write the Report

- Write `{diff_taint_pass_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
