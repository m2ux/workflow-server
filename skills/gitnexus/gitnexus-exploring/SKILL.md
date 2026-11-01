---
name: gitnexus-exploring
description: "Use when the user asks how code works, wants to understand architecture, trace execution flows, or explore unfamiliar parts of the codebase. Examples: \"How does X work?\", \"What calls this function?\", \"Show me the auth flow\""
---

# Exploring Codebases with GitNexus

Explains how unfamiliar code works by reading the GitNexus knowledge graph's execution flows and symbols. Each request is answered in [Operations](references/operations.md):

- [Explore a Codebase](references/operations.md#explore-a-codebase): how a feature such as authentication works, the project structure, the main components, where logic such as database access lives, or code not seen before
- [Resources](references/operations.md#resources): what each `gitnexus://` resource returns, and its size

## Rules

- **Stale index.**
  Where the context resource reports "Index is stale", rebuild the index through [Index a Repository](../gitnexus-cli/references/operations.md#index-a-repository) before continuing.

## Dependencies

- **GitNexus MCP server**
  Serves the `gitnexus_*` tools and the `gitnexus://` resources the procedure reads.
- **GitNexus index**
  Built by [GitNexus CLI](../gitnexus-cli/SKILL.md) for the repository being explored.
