---
metadata:
  version: 1.0.0
---

## Capability

State what the group-concept-search run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_group_name

A configured repository group whose members the positive case ranks.

### positive_search_query

A concept the group's members carry, so the positive case lands results.

### positive_group_query_report

Execution flows drawn from the group's members and merged into one ranking, each carrying the member it came from.

### positive_graph_inventory

Every indexed graph with the tree it was built from, and the repository groups configured over them, which is where a group name that resolves to nothing is settled.

### negative_group_name

A configured repository group whose members the negative case ranks.

### negative_search_query

A concept no member carries, so the negative case lands empty results across the group.

### negative_group_query_report

Execution flows drawn from the group's members and merged into one ranking, each carrying the member it came from — with empty results across every member by construction.

### negative_graph_inventory

Every indexed graph with the tree it was built from, and the repository groups configured over them, which is where a group name that resolves to nothing is settled.

## Outputs

### group_concept_search_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-group-concept-search-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_group_name}` and `{positive_search_query}` against `{positive_group_query_report}` and `{positive_graph_inventory}`, the negative binding `{negative_group_name}` and `{negative_search_query}` against `{negative_group_query_report}` and `{negative_graph_inventory}`, with `{repo_name}` as the graph the header names — per [Template](/conformance/resources/case-report.md#template).
   > A `{negative_group_query_report}` whose results are empty across every member is the concept resolving to nothing in a group every member of which was ranked; the row names that fallback, distinct from a member missing from the group's status, which `{negative_graph_inventory}` settles.

### 2. Write the Report

- Write `{group_concept_search_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
