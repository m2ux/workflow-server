---
metadata:
  version: 2.2.0
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

The ranked flows, each with `_repo` — the member's path within the group — the ranking fields a single graph's flow carries, and a merged `_rrf_score`. The ranking is the whole answer: the flows' symbols and the definitions a single graph returns beside them are absent.

#### per_repo

How many flows each member contributed before the merge, one entry per member with its `repo` path and `count`.

## Protocol

### 1. Search the Group

- Call `gitnexus_query { search_query, limit, service: service_prefix, repo: "@{group_name}" }` to produce the `{group_query_report}`, addressing `repo` as `"@{group_name}/{member_path}"` where one member is meant.
   > - Where nothing matches across the group, broaden the terms; fall back to grep for pure text patterns.
   > - A group-addressed answer carries no `staleness` mapping; the age of each member's evidence is read from the group's status.

### 2. Read a Result's Rank

- Read a result's rank as agreement across the group, not strength within one member: the fusion compares no scores between members.

### 3. Take the Member for a Follow-Up

- Address a follow-up — the symbols of a flow, the definitions around it — to the member each result's `_repo` names, carrying as `{repo_name}` the registry name the group's configuration maps that path to.
