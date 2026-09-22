---
metadata:
  version: 1.2.0
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

The functional areas this change reaches.

#### entry

##### name

What the area is called, and the identifier `gitnexus://repo/{repo_name}/cluster/{name}` takes.

##### symbols

*(optional)* How many symbols the area holds, as the inventory carries it.

##### cohesion

*(optional)* Its cohesion as a percentage, as the inventory carries it. An area kept for a flow symbol the inventory omits is named alone.

## Protocol

### 1. Keep the Areas the Change Reaches

- Take the affected execution flows from `{change_report}`, and the file each changed symbol sits in.
- Keep every area of `{cluster_inventory}` holding one of those files, or a symbol on one of those flows, and record them as `{affected_clusters}`.
   > An area a changed symbol calls into is reached without holding a changed file. Where the flows name a symbol outside every kept area, keep that symbol's area too, so the bound follows the change rather than the file list.
