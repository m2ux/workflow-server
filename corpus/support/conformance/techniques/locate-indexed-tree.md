---
metadata:
  version: 1.0.0
---

## Capability

Name the tree an indexed graph was built from, so a case binds a tree the index holds by its registry name rather than by one machine's path.

## Inputs

### graph_name

Registry name of the indexed graph whose tree the case binds.

### graph_inventory

Every indexed graph with the tree it was built from.

## Outputs

### indexed_tree_path

Filesystem path of the tree `{graph_name}` was built from, as the inventory records it. Empty when the inventory holds no graph by that name.

## Protocol

### 1. Find the Graph

- Take the entry of `{graph_inventory}` whose name is `{graph_name}`, and land the tree it was built from as `{indexed_tree_path}`.
  > Where no entry carries that name, `{indexed_tree_path}` is empty.

## Rules

### an-absent-graph-names-no-tree

A graph the index does not hold has no tree to name. `{indexed_tree_path}` stays empty rather than taking a path the case expects the tree at, so a case that binds it can say the index holds no such graph instead of measuring a tree nobody indexed.
