---
metadata:
  version: 2.0.0
---

## Capability

Search every graph in a repository group at once, with the members' results merged into a single ranking.

## Inputs

### group_name

Name of a configured repository group.

### search_query

a concept, symptom, or error text (e.g. `'ledger state commitment'`)

### member_path

*(optional)* Restricts the search to one member, named by its path within the group such as `app/backend`.

### service_prefix

*(optional)* A path prefix inside the members' trees, such as `services/ledger`, keeping only the flows whose symbols sit beneath it.

### limit

*(optional)* How many merged results the answer carries.

## Outputs

### group_query_report

Execution flows drawn from the group's members and merged into one ranking, each carrying the member it came from.

#### results

The ranked flows, each carrying `_repo` — the path within the group of the member it came from — alongside the fields a single graph's ranked flow carries.

#### per_repo

How many flows each member contributed before the merge, one entry per member with its `repo` path and `count`.

## Protocol

### 1. Search the Group

- Call `gitnexus_query { search_query, limit, service: service_prefix, repo: "@{group_name}" }` to produce the `{group_query_report}`, addressing `repo` as `"@{group_name}/{member_path}"` where one member is meant.
   > - Where nothing matches across the group, broaden the terms; fall back to grep for pure text patterns.
   > - A group-addressed answer carries no `staleness` mapping; the age of each member's evidence is read from the group's status.

### 2. Read a Result's Rank

- Read a result's rank as agreement across the group rather than strength within one member: the ranking fuses each member's ranking rather than comparing scores between them, so position says which members surfaced a flow and not how strongly any one of them did.

### 3. Take the Member for a Follow-Up

- Take the member each result's `_repo` names as the graph a follow-up addresses: a read that goes deeper inside one component carries, as its `{repo_name}`, the registry name the group's configuration maps that path to.
