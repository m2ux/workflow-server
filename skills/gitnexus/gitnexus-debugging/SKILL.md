---
name: gitnexus-debugging
description: "Use when the user is debugging a bug, tracing an error, or asking why something fails. Examples: \"Why is X failing?\", \"Where does this error come from?\", \"Trace this bug\""
---

# Debugging with GitNexus

Traces a bug, error or unexpected behaviour to its root cause through the GitNexus knowledge graph. Each request is answered in [Operations](references/operations.md):

- [Trace a Bug](references/operations.md#trace-a-bug): why a function fails, where an error comes from, who calls a method, an endpoint returning 500, or any bug, error or unexpected behaviour
- [Debugging Patterns](references/operations.md#debugging-patterns): the GitNexus approach that fits each symptom

## Rules

- **Stale index.**
  Where a tool reports "Index is stale", rebuild the index through [Index a Repository](../gitnexus-cli/references/operations.md#index-a-repository) before continuing.

## Dependencies

- **GitNexus MCP server**
  Serves the `gitnexus_*` tools and the `gitnexus://` resources the procedure reads.
- **GitNexus index**
  Built by [GitNexus CLI](../gitnexus-cli/SKILL.md) for the repository under investigation.
