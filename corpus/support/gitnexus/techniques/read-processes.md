---
metadata:
  version: 3.0.0
---

## Capability

Read the longest execution flows a graph holds — the call chains the parser traced end to end, ranked by length.

## Outputs

### process_inventory

The twenty longest execution flows the graph traced, ranked by step count. A sample of the graph's flows rather than their total. Where the reading could not be taken, the statement of what could not be taken stands in place of the ranking.

#### entry

##### name

What names the flow end to end, and the identifier a flow's ordered trace is addressed by.

##### type

`intra_community` or `cross_community`.

##### steps

How many steps the flow runs.

### process_total

How many execution flows the graph traced in all, which a share of the whole is taken against.

## Protocol

### 1. Take the Longest Flows

- Call `gitnexus_cypher { statement: "MATCH (p:Process) RETURN p.label AS name, p.processType AS type, p.stepCount AS steps ORDER BY p.stepCount DESC LIMIT 20", repo: repo_name }` and record the rows as the `{process_inventory}`.

### 2. Take the Flow Total from the Graph

- Call `gitnexus_cypher { statement: "MATCH (p:Process) RETURN count(*) AS process_total", repo: repo_name }` and record its count as the `{process_total}`. The ranking above is capped at twenty, so a count taken from its length is the sample's size and never the graph's.

### 3. Read the Inventory as a Sample

- Read the inventory as a ranked sample of the chains the parser could follow rather than as the ways the system runs. A flow is absent from it two ways, and they take different remedies:
   > - A flow shorter than the twenty longest is traced and simply outside the sample, and stays addressable by the name a flow's ordered trace is taken under.
   > - A flow assembled inside a macro body, or reached through a type-level reference, is traced by nothing and is absent from the graph altogether — `edges-the-parser-cannot-see`. No read recovers it, and the enumeration is re-derived by hand.

### 4. Read an Empty Answer as a Reading Not Taken

- Read a bare empty ranking as a reading the graph could not give, and record that statement as the `{process_inventory}`: this graph traced no execution flow at all. Its chains were never assembled, so a flow the question expects is absent from the instrument rather than from the system.
   > The total call aggregates, so it answers one row whatever the graph holds, and that row reads zero against an empty ranking. A `{process_total}` of zero is the same reading, not a measured population of none.
