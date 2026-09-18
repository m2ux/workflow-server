---
metadata:
  version: 1.0.0
---

## Capability

Read the functional-area inventory a graph holds — every area the tree groups into, with its cohesion score.

## Outputs

### cluster_inventory

Every functional area the graph groups the tree into, each with its name and cohesion score.

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/clusters` and record it as `{cluster_inventory}`.
2. Read an area's cohesion score as how tightly its members call one another rather than as how well it is named: a low score marks an area the graph grouped on weak evidence, whose membership is worth checking against the code before a diagram rests on it.
