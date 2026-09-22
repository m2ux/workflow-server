---
metadata:
  version: 1.1.0
---

## Capability

State what the group-refresh run landed under its positive and negative bindings.

## Inputs

### positive_group_name

A configured repository group every member of which has a graph, so the positive case leaves no member behind.

### positive_group_freshness_report

The group's name, when its contract registry last synced, and one freshness entry per member, keyed by the name the registry gives it.

### positive_contract_registry_stats

What the rebuilt registry holds — the contracts extracted per member, and how many cross-link to another member.

### positive_member_rebuild_stats

The counts the graph of the member rebuilt last holds afterwards.

### positive_unrebuildable_members

The members this run leaves behind — stale, and with no graph to name the tree a rebuild would walk.

### positive_contract_report

Each contract the rebuilt registry holds with the member publishing it, its kind, and the member it cross-links to.

### negative_group_name

A configured repository group with a member no graph covers, so the negative case names it among the unrebuildable.

### negative_group_freshness_report

The group's name, when its contract registry last synced, and one freshness entry per member, keyed by the name the registry gives it.

### negative_contract_registry_stats

What the rebuilt registry holds — the contracts extracted per member, and how many cross-link to another member.

### negative_member_rebuild_stats

The counts the graph of the member rebuilt last holds afterwards.

### negative_unrebuildable_members

The members this run leaves behind — stale, and with no graph to name the tree a rebuild would walk — naming the member no graph covers by construction.

### negative_contract_report

Each contract the rebuilt registry holds with the member publishing it, its kind, and the member it cross-links to.

## Outputs

### group_refresh_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-group-refresh-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_group_name}` against `{positive_group_freshness_report}`, `{positive_member_rebuild_stats}`, `{positive_unrebuildable_members}`, `{positive_contract_registry_stats}` and `{positive_contract_report}`, the negative binding `{negative_group_name}` against `{negative_group_freshness_report}`, `{negative_member_rebuild_stats}`, `{negative_unrebuildable_members}`, `{negative_contract_registry_stats}` and `{negative_contract_report}` — per [Template](/conformance/resources/case-report.md#template).
   > A non-empty `{negative_unrebuildable_members}` naming the member with no graph is the fallback's mark, while `{negative_contract_registry_stats}` shows the registry rebuilt over the members the run could read; the row names that fallback rather than reading the member as current or the refresh as failed.

### 2. Write the Report

- Write `{group_refresh_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
