---
metadata:
  version: 1.0.0
---

## Capability

Name the indexed graph an operation addresses, and report which graphs and repository groups exist to address.

## Inputs

### tree_path

Optional. Filesystem path of the tree whose answers are wanted. Omit to enumerate what is indexed without resolving a particular tree.

## Outputs

### repo_name

The name to give the operations in this group as their `{repo_name}`. Empty when no indexed graph covers `{tree_path}`.

### graph_inventory

Every indexed graph with the tree it was built from, when it was built and the commit it was built at; and every configured repository group with its members.

## Protocol

### 1. Enumerate

- Call `gitnexus_list_repos` for the indexed graphs and `gitnexus_group_list` for the configured repository groups, and record the two together as `{graph_inventory}`.

### 2. Resolve

- Where `{tree_path}` is given, match it against the tree path each graph was built from, and take the matching graph's name as `{repo_name}`.
  > - A graph built from a tree that contains `{tree_path}` covers the content as part of a larger tree. Its name is the address that reaches the content, and every answer it gives spans the whole containing tree.
  > - Where a component's own graph and a containing tree's graph both cover `{tree_path}`, choose on the scope of the question: the component's own graph for a question inside it, the containing tree's for a question that crosses component boundaries.
  > - Where no graph covers `{tree_path}`, `{repo_name}` is empty — apply [analyze](./analyze.md) on the tree to build one.
