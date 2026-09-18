---
metadata:
  version: 1.0.0
---

## Capability

Choose, from a graph's functional areas, the ones a change's execution flows and files run through.

## Inputs

### cluster_inventory

Every functional area the graph groups the tree into, each with its name and cohesion score.

### change_report

changed symbols, changed files, affected execution flows, risk level

## Outputs

### affected_clusters

The functional areas this change reaches, each named as the cluster resource addresses it.

## Protocol

1. Take the affected execution flows and the changed files from `{change_report}`.
2. Keep every area of `{cluster_inventory}` holding one of those files, or a symbol on one of those flows, and record them as `{affected_clusters}`.
   > An area a changed symbol calls into is reached without holding a changed file. Where the flows name a symbol outside every kept area, keep that symbol's area too, so the bound follows the change rather than the file list.
