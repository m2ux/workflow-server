---
metadata:
  version: 1.1.0
---

## Capability

Map the MCP and RPC tools a tree defines — which are declared, where each is handled, and what each says it does.

## Inputs

### tool_name

*(optional)* Restricts the answer to one tool. Absent, the answer is every tool the graph holds.

## Outputs

### tool_inventory

The `tools` the graph holds, each with the file handling it and the description it registers, and their `total`. A tree the graph recorded no tool for answers with both empty and a `message` saying so, which is the same answer a tree that declares none gives — the operation reads what the graph holds, and a registration shape the parser passed over is absent from it exactly as an absent registration is. Hold an empty inventory against the tree's own registration sites before reading it as a tree that serves no tools.

## Protocol

### 1. Take the Tool Inventory

- Call `gitnexus_tool_map { tool: tool_name, repo: repo_name }` and record the `{tool_inventory}`.

### 2. Hold a Handler to Its Description

- Take the registered description as the contract a caller reads, and hold a change to the handler against it: a handler that stops doing what its description says leaves every caller acting on the description.

### 3. Read an Empty Inventory

- Read an empty inventory as a tree whose tool registrations the walk did not recognise rather than as a tree defining none — a registration built by a helper the parser reads as an ordinary call leaves no tool node.
