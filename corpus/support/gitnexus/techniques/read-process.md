---
metadata:
  version: 1.1.0
---

## Capability

Read a process resource for a step-by-step execution trace.

## Inputs

### process_name

Process identifier

## Outputs

### process_trace

The flow's ordered steps, each naming the symbol it runs and the file that symbol sits in.

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/process/{process_name}` and record the `{process_trace}` it lists.
