---
metadata:
  version: 1.0.0
---

## Capability

Read a functional-area cluster resource — area members and cohesion score.

## Inputs

### repo_name

Repository name.

### cluster_name

Cluster identifier

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/cluster/{cluster_name}`.
