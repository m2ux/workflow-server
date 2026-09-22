---
metadata:
  version: 1.2.0
---

## Capability

Map the MCP and RPC tools a tree defines — which are declared, where each is handled, and what each says it does.

## Inputs

### tool_name

*(optional)* Restricts the answer to one tool. Absent, the answer is every tool the graph holds.

## Outputs

### tool_inventory

The `tools` the graph holds, each with the file handling it and the description it registers, and their `total`. A tree with no recorded tool answers empty with a `message` saying so, whether it declares none or the parser passed its registrations over.

## Protocol

### 1. Take the Tool Inventory

- Call `gitnexus_tool_map { tool: tool_name, repo: repo_name }` and record the `{tool_inventory}`.

### 2. Hold a Handler to Its Description

- Hold a handler change against its registered description, which is the contract every caller acts on.

### 3. Read an Empty Inventory

- Hold an empty `{tool_inventory}` against the tree's registration sites before reading it as a tree that serves none: a registration built by a helper the parser reads as an ordinary call leaves no tool node.
