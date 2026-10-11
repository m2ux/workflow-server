---
metadata:
  version: 1.0.0
---

## Capability

The members of a repository group as a list a run can walk — each with the graph name the group addresses it by, the tree that graph was built from, and whether it is the member a concern was raised in.

## Inputs

### group_name

Name of the configured repository group.

### home_repo

The graph name of the member the concern was raised in, which the list marks so a probe can leave it out.

## Outputs

### group_members

The group's members, in the order the group configuration lists them.

#### entry

##### name

The registry name the group addresses the member by, which is the `{repo_name}` a technique takes.

##### tree_path

The tree the member's graph was built from. Empty where no indexed graph carries the member's name.

##### is_home

True for the member whose name is `{home_repo}`.

## Protocol

### 1. Take the Member Names

- Call `gitnexus_group_list { name: group_name }` and take the keys of its `repos` as the member names, in the order given.

### 2. Pair Each With Its Tree

- Call `gitnexus_list_repos` and, for each member name, take the `path` of the indexed graph of that name as its tree; record name and tree as one entry of `{group_members}`, marking `is_home` where the name is `{home_repo}`.
  > A member no indexed graph is named for keeps its entry with an empty tree: it is a member the group addresses and no technique can answer for, which the reach judgement reports rather than skips.
