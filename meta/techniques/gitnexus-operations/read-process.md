---
metadata:
  version: 1.0.0
---

## Capability

Read a process resource for a step-by-step execution trace.

## Inputs

### repo-name

Repository name.

### process-name

Process identifier

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo-name}/process/{process-name}`.
