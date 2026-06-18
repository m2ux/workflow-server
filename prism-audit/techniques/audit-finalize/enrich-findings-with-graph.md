---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Enrich each finding that references a specific symbol with measured graph evidence — its blast radius and its execution-flow participation — producing per-finding annotations for the detailed-findings document's Graph Evidence subsections.

## Protocol

### 1. Enrich Findings with Graph Data

- For each finding in `{source_report}` that references a specific symbol, apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../../meta/techniques/gitnexus-operations/impact.md)`(direction: 'upstream')` to compute the measured blast radius.
- Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) on the same symbol to determine its execution-flow participation.
- Write the combined enrichment data as `{graph_evidence}` annotations for the detailed-findings document's per-finding 'Graph Evidence' subsections.

## Outputs

### graph_evidence

Per-finding blast-radius and execution-flow annotations keyed by finding
