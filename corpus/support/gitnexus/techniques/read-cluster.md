---
metadata:
  version: 1.1.0
---

## Capability

Read a functional-area cluster resource — area members and cohesion score.

## Inputs

### cluster_name

Cluster identifier

## Outputs

### cluster_members

The area's members, each with the file it sits in, alongside the area's cohesion score.

## Protocol

### 1. Read the Area's Members

- Read the MCP resource `gitnexus://repo/{repo_name}/cluster/{cluster_name}` and record the `{cluster_members}` it lists.
