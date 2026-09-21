---
metadata:
  version: 1.2.0
---

## Capability

Search every graph in a repository group at once, with the members' results merged into a single ranking.

## Inputs

### group_name

Name of a configured repository group.

### search_query

a concept, symptom, or error text (e.g. `'ledger state commitment'`)

### subgroup_prefix

*(optional)* Restricts the search to members whose path within the group starts with this prefix.

### limit

*(optional)* How many merged results the answer carries.

## Outputs

### group_query_report

Execution flows drawn from the group's members and merged into one ranking, each carrying the member it came from.

## Protocol

### 1. Search the Group

- Call `gitnexus_group_query { name: group_name, query: search_query, subgroup: subgroup_prefix, limit }` to produce the `{group_query_report}`.
   > - Where nothing matches across the group, broaden the terms; fall back to grep for pure text patterns.

### 2. Read a Result's Rank

- Read a result's rank as agreement across the group rather than strength within one member: the ranking fuses each member's ranking rather than comparing scores between them, so position says which members surfaced a flow and not how strongly any one of them did.

### 3. Take the Member for a Follow-Up

- Take the member each result came from as the graph a follow-up addresses: a read that goes deeper inside one component carries that member's name as its `{repo_name}`.
