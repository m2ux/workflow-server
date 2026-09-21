---
metadata:
  version: 2.1.0
---

## Capability

Read the functional-area inventory a graph holds — the areas clearing a size floor, each with its symbol count and cohesion score.

## Outputs

### cluster_inventory

The graph's functional areas above a size floor, ordered by symbol count descending. An area is a label several of the graph's communities aggregate under: its symbol count sums them, and its cohesion is their symbol-weighted mean.

#### entry

##### name

What the area is called, and the identifier `gitnexus://repo/{repo_name}/cluster/{name}` takes.

##### symbols

How many symbols the area holds, summed over the communities its label aggregates.

##### cohesion

Its cohesion as a percentage, the symbol-weighted mean over those communities.

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/clusters` and record it as `{cluster_inventory}`.
   > Two cuts apply and neither is announced: the inventory drops an area below five symbols, and shows at most twenty. On a `workflow-server` graph holding twenty areas it returns sixteen, the smallest of them five symbols. An area absent from it is therefore smaller than the smallest shown rather than absent from the graph, and stays readable by name at `gitnexus://repo/{repo_name}/cluster/{name}`. Where the inventory returns twenty entries, read it as a graph whose area count it does not report.
2. Read an area's cohesion score as the symbol-weighted mean over the communities its label aggregates, so a mid-range score on a large area spans a wide range rather than describing one evenly-knit group. A low score marks membership worth checking against the code before a diagram rests on it.
