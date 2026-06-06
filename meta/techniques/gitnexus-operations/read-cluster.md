---
metadata:
  version: 1.0.0
---

## Capability

Read a functional-area cluster resource — area members and cohesion score.

## Inputs

### repo-name

Repository name.

### cluster-name

Cluster identifier

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo-name}/cluster/{cluster-name}`.
