---
metadata:
  version: 1.0.0
---

## Capability

Search every graph in a repository group at once, with the members' results merged into a single ranking.

## Inputs

### group_name

Name of a configured repository group.

### search_query

a concept, symptom, or error text (e.g. `'ledger state commitment'`)

### subgroup_prefix

Optional. Restricts the search to members whose path within the group starts with this prefix.

## Outputs

### group_query_report

Execution flows drawn from the group's members and merged into one ranking, each carrying the member it came from.

## Protocol

1. Call `gitnexus_group_query {group_name, search_query, subgroup_prefix}` to produce the `{group_query_report}`.
   > - Where `{group_name}` does not resolve, apply [resolve-graph](./resolve-graph.md) and read the configured groups from `{graph_inventory}`.
   > - Where nothing matches across the group, broaden the terms; fall back to grep for pure text patterns.
2. Read a result's rank as agreement across the group rather than strength within one member: the ranking fuses each member's ranking rather than comparing scores between them, so position says which members surfaced a flow and not how strongly any one of them did.
3. Take the member each result came from as the graph to address for a follow-up — apply [query](./query.md) or [context](./context.md) with that member's name as `{repo_name}` to go deeper in one component.
