---
metadata:
  version: 1.2.0
---

## Capability

State what the tool-surface run landed under its positive and negative bindings.

## Inputs

### positive_repo_name

The graph the positive case's read addressed.

### negative_repo_name

The graph the negative case's read addressed.

### positive_tree_path

Filesystem path of the host repository, a tree registering MCP tools by calling a method.

### negative_tree_path

Filesystem path of the markdown tree the index holds under the docs graph, which carries no tool declarations.

### positive_tool_inventory

Each declared tool with the file handling it and the description it registers — empty, the tree registering its tools in a shape the walk does not record as a tool node.

### negative_tool_inventory

Each declared tool with the file handling it and the description it registers — empty by construction, with the run's note reading the emptiness as registrations the walk did not recognise.

## Outputs

### tool_surface_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-tool-surface-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_tree_path}` against `{positive_tool_inventory}`, named `{positive_repo_name}`, and the negative binding `{negative_tree_path}` against `{negative_tool_inventory}`, named `{negative_repo_name}` — per [Template](/conformance/resources/case-report.md#template).
   > The two cases address different graphs, so the header lists both and each row names its own.
   > `{positive_tool_inventory}` and `{negative_tool_inventory}` are both empty with the run's note on each: the positive tree registers its tools in a shape the walk does not record, and the markdown tree declares none. Each row names the tree it bound, the one answer standing for both.

### 2. Write the Report

- Write `{tool_surface_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
