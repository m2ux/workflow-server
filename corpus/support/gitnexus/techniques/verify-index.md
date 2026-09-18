---
metadata:
  version: 2.0.0
---

## Capability

Read the GitNexus index context resource for the target repo: what the graph holds, and whether it still describes the tree it was built from.

## Outputs

### stats

Symbol / relationship / process counts

### index_stale

Boolean — true where the graph is behind the tree it was built from, and true where no graph covers that tree at all.

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/context` and record the reported `{stats}` and `{index_stale}`.
   > Where no graph covers the target repository the read answers nothing: `{index_stale}` is true and `{stats}` is empty, which is the verdict a stale graph earns and takes the same remedy.
2. Carry `{index_stale}` as the age of every answer taken from this graph afterwards; `gitnexus.index-freshness-first` says what clears it.
