---
name: gitnexus-refactoring
description: "Use when the user wants to rename, extract, split, move, or restructure code safely. Examples: \"Rename this function\", \"Extract this into a module\", \"Refactor this class\", \"Move this to a separate file\""
---

# Refactoring with GitNexus

Renames, extracts, splits and restructures code safely, mapping every reference through the GitNexus knowledge graph first. Each request is answered in [Operations](references/operations.md):

- [Plan a Refactor](references/operations.md#plan-a-refactor): any task renaming, extracting, splitting or restructuring code
- [Rename a Symbol](references/operations.md#rename-a-symbol): renaming a function safely
- [Extract a Module](references/operations.md#extract-a-module): extracting code into a module, or moving it to a new file
- [Split a Function or Service](references/operations.md#split-a-function-or-service): splitting a function or service
- [Risk Mitigations](references/operations.md#risk-mitigations): the mitigation each risk factor calls for

## Rules

- **Stale index.**
  Where a tool reports "Index is stale", rebuild the index through [Index a Repository](../gitnexus-cli/references/operations.md#index-a-repository) before continuing.

## Dependencies

- **GitNexus MCP server**
  Serves the `gitnexus_*` tools the procedures call, `gitnexus_rename` among them.
- **GitNexus index**
  Built by [GitNexus CLI](../gitnexus-cli/SKILL.md) for the repository being refactored.
