---
metadata:
  version: 2.1.0
---

## Capability

Read the longest execution flows a graph holds — the call chains the parser traced end to end, ranked by length.

## Outputs

### process_inventory

The twenty longest execution flows the graph traced, ranked by step count. A sample of the graph's flows rather than their total.

#### entry

##### name

What names the flow end to end, and the identifier `gitnexus://repo/{repo_name}/process/{name}` takes.

##### type

`intra_community` or `cross_community`.

##### steps

How many steps the flow runs.

## Protocol

### 1. Read the Inventory

- Read the MCP resource `gitnexus://repo/{repo_name}/processes` and record it as `{process_inventory}`.

### 2. Take the Flow Total from the Graph

- Take the graph's flow total from `stats.processes` in `gitnexus://repo/{repo_name}/context` wherever a share of the whole is wanted. This inventory is capped, and its trailing comment states the cap, so a count taken from its length is the sample's size and never the graph's.

### 3. Read the Inventory as a Sample

- Read the inventory as a ranked sample of the chains the parser could follow rather than as the ways the system runs. A flow is absent from it two ways, and they take different remedies:
   > - A flow shorter than the twenty longest is traced and simply outside the sample. Read it by name at `gitnexus://repo/{repo_name}/process/{name}`.
   > - A flow assembled inside a macro body, or reached through a type-level reference, is traced by nothing and is absent from the graph altogether — edges-the-parser-cannot-see. No read recovers it, and the enumeration is re-derived by hand.
