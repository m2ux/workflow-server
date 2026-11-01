---
name: gitnexus-impact-analysis
description: "Use when the user wants to know what will break if they change something, or needs safety analysis before editing code. Examples: \"Is it safe to change X?\", \"What depends on this?\", \"What will break?\""
---

# Impact Analysis with GitNexus

Measures what a change to code would break, from the GitNexus knowledge graph's dependents and execution flows. Each request is answered in [Operations](references/operations.md):

- [Assess a Change](references/operations.md#assess-a-change): whether changing a function is safe, what breaks if X changes, a blast radius, who uses some code, or a check before a non-trivial change or before committing
- [Output Depths](references/operations.md#output-depths): what each depth of an impact result means
- [Risk Levels](references/operations.md#risk-levels): the risk an affected scope carries

## Rules

- **Stale index.**
  Where a tool reports "Index is stale", rebuild the index through [Index a Repository](../gitnexus-cli/references/operations.md#index-a-repository) before continuing.

## Dependencies

- **GitNexus MCP server**
  Serves the `gitnexus_*` tools and the `gitnexus://` resources the procedure reads.
- **GitNexus index**
  Built by [GitNexus CLI](../gitnexus-cli/SKILL.md) for the repository being changed.
