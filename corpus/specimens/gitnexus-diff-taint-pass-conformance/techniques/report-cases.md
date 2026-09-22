---
metadata:
  version: 1.2.0
---

## Capability

State what the diff-taint-pass run landed under its positive, negative and absent-layer bindings.

## Inputs

### taint_layer_graph

Name of the graph carrying its taint layer, which the positive and negative cases addressed.

### absent_layer_graph

Name of the graph built without its taint layer, which the absent-layer case addressed.

### base_ref

The commit the absent-layer case's compare-scoped detection measured the working tree against.

### positive_introduced_flows

Findings with a hop on a symbol the change moved, each naming that symbol — empty, the positive case's changed symbols carrying no flow.

### positive_inherited_flows

Findings anchored at a changed symbol whose every hop sits outside the change — empty, the positive case's changed symbols carrying no flow.

### positive_taint_unmeasured

Whether the graph carried no taint layer, so the partition settles nothing.

### negative_introduced_flows

Findings with a hop on a symbol the change moved, each naming that symbol.

### negative_inherited_flows

Findings anchored at a changed symbol whose every hop sits outside the change.

### negative_taint_unmeasured

Whether the graph carried no taint layer, so the partition settles nothing.

### absent_layer_introduced_flows

Findings with a hop on a symbol the change moved, each naming that symbol.

### absent_layer_inherited_flows

Findings anchored at a changed symbol whose every hop sits outside the change.

### absent_layer_taint_unmeasured

Whether the graph carried no taint layer, so the partition settles nothing.

## Outputs

### diff_taint_pass_case_report

Three rows for the one run: the graph and bindings each case took, whether each materialised, what each landed, and which fallback the negative and absent-layer cases each took.

#### artifact

`gitnexus-diff-taint-pass-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the three cases — the positive against `{positive_introduced_flows}`, `{positive_inherited_flows}` and `{positive_taint_unmeasured}`, the negative against `{negative_introduced_flows}`, `{negative_inherited_flows}` and `{negative_taint_unmeasured}`, and a third row named `absent-layer-case` against `{absent_layer_introduced_flows}`, `{absent_layer_inherited_flows}` and `{absent_layer_taint_unmeasured}` — per [Template](/conformance/resources/case-report.md#template), with `{taint_layer_graph}` and `{absent_layer_graph}` both named in the header and each row naming in its `Graph` column the one its answers came from.
   > The positive and negative rows name `{taint_layer_graph}` there, and the `absent-layer-case` row names `{absent_layer_graph}` there and `{base_ref}`, the commit its comparison measured against, in its inputs column, so a reader sees which graph and which diff each row's answers came from.
   > Empty `{positive_introduced_flows}` and `{positive_inherited_flows}` with `{positive_taint_unmeasured}` false is a layer that read the changed symbols and found no flow; the row names that reading rather than a partition over findings.
   > An empty `{negative_introduced_flows}` beside an empty `{negative_inherited_flows}` with `{negative_taint_unmeasured}` false is an empty change set — nothing staged, so the per-symbol pass ran zero times and no layer read was attempted; the row names that fallback rather than reading the change as partitioned and clean, and rather than reading the layer as absent, which only a true flag says.
   > The `absent-layer-case` row's mark is `{absent_layer_taint_unmeasured}` true: the comparison landed changed symbols, each taint report carried the note stating the graph holds no taint layer, and `{absent_layer_introduced_flows}` and `{absent_layer_inherited_flows}` are empty by construction; the row names the absent layer rather than reading the change as partitioned and clean, and rather than reading the change set as empty, which only a false flag beside empty lists says.

### 2. Write the Report

- Write `{diff_taint_pass_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
