---
name: gitnexus-operations
description: Parameterized GitNexus operations — primitive tool wrappers and composite analysis recipes — used by work-package techniques.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 26
  legacy_id: 26
---

# GitNexus Operations

## Capability

Parameterized GitNexus operations for the work-package workflow. Primitive operations wrap each GitNexus MCP tool with the canonical work-package parameter set and output interpretation; composite operations encode the multi-call analysis recipes that recur across review and planning techniques. For the underlying tool, resource, and graph-schema reference, see [gitnexus-reference](../../resources/gitnexus-reference.md).

## Rules

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations. Do NOT paste raw `gitnexus_*` calls or Cypher into technique protocols — raw calls appear only inside the operation procedures here. grep / Read / glob are the fallback ONLY when the codebase is not indexed or the index is stale. This is a requirement, not a preference: it keeps tool-usage parameterised in one place and keeps technique protocols readable.

### index-freshness

Before the first operation in a session, confirm index freshness by reading `gitnexus://repo/{name}/context`. If it reports the index is stale, run `npx gitnexus analyze` in the terminal before relying on any operation's results. Every operation's `stale_index` recovery points back here.
