---
metadata:
  version: 3.0.0
---

## Capability

Read the functional-area inventory a graph holds — the areas clearing a size floor, each with its symbol count and cohesion score.

## Outputs

### cluster_inventory

The graph's functional areas above a size floor, ordered by symbol count descending. An area is a label several of the graph's communities aggregate under: its symbol count sums them, and its cohesion is their symbol-weighted mean. Where the reading could not be taken, the statement of what could not be taken stands in place of the inventory.

#### entry

##### name

What the area is called, and the identifier one area's membership is addressed by.

##### symbols

How many symbols the area holds, summed over the communities its label aggregates.

##### cohesion

Its cohesion as a percentage, the symbol-weighted mean over those communities.

## Protocol

### 1. Take the Inventory

- Call `gitnexus_cypher { statement: "MATCH (c:Community) WITH c.label AS name, sum(c.symbolCount) AS symbols, sum(c.cohesion * c.symbolCount) AS weighted WHERE symbols >= 5 RETURN name, symbols, 100 * weighted / symbols AS cohesion ORDER BY symbols DESC LIMIT 20", repo: repo_name }` and record the rows as the `{cluster_inventory}`.
   > Two cuts are the query's own terms: it drops an area below five symbols, and it carries at most twenty. An area absent from the inventory is therefore smaller than the smallest shown, or ranked below the twentieth, rather than absent from the graph — and stays readable under the name one area's membership is addressed by.

### 2. Read a Cohesion Score

- Read an area's cohesion score as the symbol-weighted mean over the communities its label aggregates, so a mid-range score on a large area spans a wide range rather than describing one evenly-knit group. A low score marks membership worth checking against the code before a diagram rests on it.

### 3. Read an Empty Answer as a Reading Not Taken

- Read a bare empty answer as a reading the graph could not give rather than as a tree with no structure, and record that statement as the `{cluster_inventory}`: this graph groups no area of five symbols or more. Its communities were never detected, or every one of them is smaller than the floor, and which of the two holds is settled by dropping the floor rather than by reading the emptiness.
