---
metadata:
  version: 1.0.0
---

## Capability

Read the execution-flow inventory a graph holds — every call chain the parser traced end to end.

## Outputs

### process_inventory

Every execution flow the graph traced through the tree, each with its name and how many steps it runs.

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/processes` and record it as `{process_inventory}`.
2. Read the inventory as the chains the parser could follow rather than as the ways the system runs: a flow assembled inside a macro body, or reached through a type-level reference, is traced by nothing and appears here as no flow at all — gitnexus.edges-the-parser-cannot-see.
