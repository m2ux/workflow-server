---
metadata:
  version: 1.2.0
---

## Capability

Settle which members of a repository group a rebuild reaches, and pair each with the tree it walks.

## Inputs

### group_freshness_report

The group's name, when its contract registry last synced, and one freshness entry per member.

### graph_inventory

Every indexed graph with the tree it was built from, and the group's configuration mapping each member's path to the registry name its graph is addressed by.

## Outputs

### stale_members

The members a rebuild reaches, as a list, ordered by `commits_behind` with the furthest first.

#### entry

##### name

The registry name the member's graph is addressed by.

##### member_path

The member's path within the group, which the freshness report keys it by.

##### commits_behind

How far the member's evidence has aged.

##### tree_path

The tree the rebuild walks, taken from the graph inventory.

### unrebuildable_members

The members the report marks stale and the inventory names no tree for, by name. Empty where every stale member has a graph to rebuild from.

## Protocol

### 1. Keep the Stale Members

- Walk the keys of `{group_freshness_report}`'s `repos` and keep each member whose entry marks `indexStale`, `missing` or `unresolvable`. A member marking none answers from the commit its code stands at, which is where a rebuild would leave it.

### 2. Resolve Each Member's Tree

- Take each kept member's registry name from the group's configuration in `{graph_inventory}`, matching on the path the report keys it by, and its tree from the indexed-graph half of the inventory under that name; record the four together as one entry of `{stale_members}`.

### 3. Order by Age

- Order the list by `commits_behind`, furthest first, so a run that cannot finish has rebuilt the members whose evidence was oldest.

### 4. Name the Unrebuildable

- Leave out a member the inventory names no tree for, and name it in `{unrebuildable_members}`.
   > A member marked `missing` has no graph, so the inventory holds no entry and no operation here yields its tree. Rebuilding it takes a path from whoever holds the checkout, which is a question for a person rather than an answer the group carries. A run that passed such a member on with no tree would walk from nowhere.
