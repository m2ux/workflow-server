---
metadata:
  version: 1.1.0
---

## Capability

Settle which members of a repository group a rebuild reaches, and pair each with the tree it walks.

## Inputs

### group_freshness_report

The group's name, when its contract registry last synced, and one freshness entry per member.

### graph_inventory

Every indexed graph with the tree it was built from, which is where a member's tree is named.

## Outputs

### stale_members

The members a rebuild reaches, as a list, ordered by `commits_behind` with the furthest first.

#### entry

##### name

What the freshness report keys the member by.

##### commits_behind

How far the member's evidence has aged.

##### tree_path

The tree the rebuild walks, taken from the graph inventory.

### unrebuildable_members

The members the report marks stale and the inventory names no tree for, by name. Empty where every stale member has a graph to rebuild from.

## Protocol

### 1. Keep the Stale Members

- Walk the keys of `{group_freshness_report}`'s `repos` and keep each member whose entry marks `indexStale` or `missing`. A member marking neither answers from the commit its code stands at, which is where a rebuild would leave it.

### 2. Resolve Each Member's Tree

- Take each kept member's tree from `{graph_inventory}`, matching on the name the report keys it by, and record the three together as one entry of `{stale_members}`.

### 3. Order by Age

- Order the list by `commits_behind`, furthest first, so a run that cannot finish has rebuilt the members whose evidence was oldest.

### 4. Name the Unrebuildable

- Leave out a member the inventory names no tree for, and name it in `{unrebuildable_members}`.
   > A member marked `missing` has no graph, so the inventory holds no entry and no operation here yields its tree. Rebuilding it takes a path from whoever holds the checkout, which is a question for a person rather than an answer the group carries. A run that passed such a member on with no tree would walk from nowhere.
