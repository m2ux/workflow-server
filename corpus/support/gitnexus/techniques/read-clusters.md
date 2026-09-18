---
metadata:
  version: 2.0.0
---

## Capability

Read the functional-area inventory a graph holds — the areas clearing a size floor, each with its symbol count and cohesion score.

## Outputs

### cluster_inventory

The graph's functional areas above a size floor, each with its name, symbol count and cohesion score, ordered by symbol count descending. An area is a label several of the graph's communities aggregate under: its symbol count sums them, and its cohesion is their symbol-weighted mean.

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/clusters` and record it as `{cluster_inventory}`.
   > The inventory holds the areas of five symbols or more, and reports no notice where it leaves one out. A smaller area stays readable by name at `gitnexus://repo/{repo_name}/cluster/{name}`, so absence from the inventory bounds an area's size rather than saying it does not exist.
2. Read an area's cohesion score as the symbol-weighted mean over the communities its label aggregates, so a mid-range score on a large area spans a wide range rather than describing one evenly-knit group. A low score marks membership worth checking against the code before a diagram rests on it.
