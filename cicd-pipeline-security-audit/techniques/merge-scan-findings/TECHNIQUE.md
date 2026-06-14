---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Merge findings from multiple scanner agents into a unified set: deduplicate findings sharing the same file, line, and pattern; identify compound vulnerability chains where multiple patterns converge on one workflow; and produce a reconciliation table mapping every scanner finding to its merged counterpart. The operations in this set decompose that merge into output-loading, deduplication, cross-pattern correlation, reconciliation, and output-writing phases.

## Inputs

### scanner_outputs

The per-submodule scanner [output files](../../resources/sub-agent-output-schema.md#schema), one per scanner agent

## Outputs

### merged_findings

Unified [finding set](../../resources/intermediate-artifact-schemas.md#merged-findings)

#### artifact

`merged-findings.json`

#### findings

Deduplicated and correlated findings

#### compounds

Compound vulnerability chains

#### observations

Informational items without clear source-to-sink flow

### reconciliation

Per-scanner finding mapping to merged findings — the [reconciliation table](../../resources/intermediate-artifact-schemas.md#reconciliation)

#### artifact

`reconciliation-table.json`

## Rules

### observation-retention

Observations are preserved even if they don't rise to finding level
