---
name: gitnexus-operations
description: Parameterized GitNexus operations — primitive tool wrappers and composite analysis recipes — used by work-package skills.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 26
  legacy_id: 26
---

# GitNexus Operations

## Capability

Parameterized GitNexus operations for the work-package workflow. Primitive operations wrap each GitNexus MCP tool with the canonical work-package parameter set and output interpretation; composite operations encode the multi-call analysis recipes that recur across review and planning skills. For the underlying tool, resource, and graph-schema reference, see [gitnexus-reference](../../resources/gitnexus-reference.md).

## Operations

### Primitive

| Operation | Purpose |
|---|---|
| [impact](./impact.md) | Symbol blast radius (upstream/downstream) with confidence and risk level — the primary pre-edit safety check |
| [context](./context.md) | 360-degree view of one symbol (callers, callees, process membership) |
| [detect-changes](./detect-changes.md) | Map the current git diff to changed symbols and affected execution flows |
| [query](./query.md) | Find execution flows related to a concept, symptom, or error string |
| [cypher](./cypher.md) | Raw graph query for traces and filters not covered by higher-level operations |

### Composite

| Operation | Purpose | Caller |
|---|---|---|
| [orphan-scan](./orphan-scan.md) | Find unreferenced symbols introduced by the diff (over-engineering candidates) | review-strategy |
| [public-api-enum](./public-api-enum.md) | Enumerate exported symbols in the diff that need doc comments | finalize-documentation |
| [diff-coverage-map](./diff-coverage-map.md) | Drive test-coverage review from the changed-symbol set | review-test-suite |
| [scope-discipline-check](./scope-discipline-check.md) | Flag affected flows outside the work package's intended scope | review-strategy, respond-to-pr-review |
| [diagram-source-select](./diagram-source-select.md) | Source architecture-diagram structure from graph resources, bounded to affected processes | summarize-architecture |
| [complexity-signal](./complexity-signal.md) | Objective complexity estimate from fan-out of a preliminary target symbol | classify-problem |
| [reversibility-signal](./reversibility-signal.md) | Reversibility flag for judgement-augmentation assumptions | review-assumptions |

## Rules

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations. Do NOT paste raw `gitnexus_*` calls or Cypher into skill protocols — raw calls appear only inside the operation procedures here. grep / Read / glob are the fallback ONLY when the codebase is not indexed or the index is stale. This is a requirement, not a preference: it keeps tool-usage parameterised in one place and keeps skill protocols readable.

### index-freshness

Before the first operation in a session, confirm index freshness by reading `gitnexus://repo/{name}/context`. If it reports the index is stale, run `npx gitnexus analyze` in the terminal before relying on any operation's results. Every operation's `stale_index` recovery points back here.
