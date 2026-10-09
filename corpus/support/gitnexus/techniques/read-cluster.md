---
metadata:
  version: 2.0.0
---

## Capability

Take one functional area's membership and its cohesion score from the graph.

## Inputs

### cluster_name

Cluster identifier — the area label the area inventory lists.

## Outputs

### cluster_members

The area's members, each with its name, its kind and the file it sits in, alongside the area's symbol count and cohesion score. Where the reading could not be taken, the statement of what could not be taken stands in place of the membership.

## Protocol

### 1. Take the Area's Members

- Call `gitnexus_cypher { statement: "MATCH (s)-[r:CodeRelation]->(c:Community) WHERE r.type = 'MEMBER_OF' AND c.label = $cluster_name RETURN s.name AS name, label(s) AS kind, s.filePath AS file ORDER BY name", params: { cluster_name: cluster_name }, repo: repo_name }` and record the rows as the membership of the `{cluster_members}`.

### 2. Take the Area's Figures

- Call `gitnexus_cypher { statement: "MATCH (c:Community) WHERE c.label = $cluster_name RETURN sum(c.symbolCount) AS symbols, 100 * sum(c.cohesion * c.symbolCount) / sum(c.symbolCount) AS cohesion", params: { cluster_name: cluster_name }, repo: repo_name }` and record the `symbols` count and the `cohesion` percentage alongside the membership.
   > An area label aggregates every community carrying it, so the count sums them and the cohesion is their symbol-weighted mean. A mid-range score on a large area spans a wide range rather than describing one evenly-knit group, and a low score marks membership worth checking against the code before a diagram rests on it.

### 3. Read an Empty Answer as a Reading Not Taken

- Read a bare empty membership as a reading the graph could not give rather than as an area holding nothing, and record that statement as the `{cluster_members}`: no area is labelled `{cluster_name}` in this graph. The label comes from this graph's own area inventory, so a name taken from another graph reaches nothing here.
   > The figures call aggregates, so it answers one row whatever the label reaches, and that row is blank where nothing matched. A blank `symbols` is the same reading as an empty membership and not an area of no symbols.
