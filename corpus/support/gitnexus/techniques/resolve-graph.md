---
metadata:
  version: 1.2.0
---

## Capability

Name the indexed graph an operation addresses, and report which graphs and repository groups exist to address.

## Inputs

### tree_path

*(optional)* Filesystem path of the tree whose answers are wanted. Absent, the answer is the inventory alone and resolves no particular tree.

## Outputs

### repo_name

The name to give the operations in this group as their `{repo_name}`. Empty when no indexed graph covers `{tree_path}`.

### graph_inventory

Every indexed graph with the tree it was built from, when it was built and the commit it was built at; and the configured repository groups by name. A group's members arrive only where the enumeration asked for that group.

## Protocol

### 1. Enumerate

- Call `gitnexus_list_repos` for the indexed graphs and `gitnexus_group_list` for the group names, and record the two together as `{graph_inventory}`.
- Call `gitnexus_group_list { name }` for each group whose members the question reaches, and record them under that group. Called with no name the operation answers with names alone, so an inventory read for a member is read one group at a time.
  > A group's members are registry names, which address a graph and name no tree. The tree each sits in comes from the indexed-graph half of this inventory, matched on that name.

### 2. Resolve

- Where `{tree_path}` is given, match it against the tree path each graph was built from, and take the matching graph's name as `{repo_name}`.
  > - A graph built from a tree that contains `{tree_path}` covers the content as part of a larger tree. Its name is the address that reaches the content, and every answer it gives spans the whole containing tree.
  > - Where a component's own graph and a containing tree's graph both cover `{tree_path}`, choose on the scope of the question: the component's own graph for a question inside it, the containing tree's for a question that crosses component boundaries.
  > - Where no graph covers `{tree_path}`, `{repo_name}` is empty: the tree carries no index, and no name reaches its content until one is built.
