---
metadata:
  version: 1.2.0
---

## Capability

Read a functional-area cluster resource — area members and cohesion score.

## Inputs

### cluster_name

Cluster identifier

## Outputs

### cluster_members

The area's members, each with its name, its kind and the file it sits in, alongside the area's symbol count and cohesion score.

## Protocol

### 1. Read the Area's Members

- Read the MCP resource `gitnexus://repo/{repo_name}/cluster/{cluster_name}` and record the `{cluster_members}` it lists.
   > The list shows at most twenty members and closes with a comment counting the rest, so the area's `symbols` count and not the list's length is how many it holds.
