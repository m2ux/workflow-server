---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Merge findings from multiple scanner agents into a unified set: deduplicate findings sharing the same file, line, and pattern; identify compound vulnerability chains where multiple patterns converge on one workflow; and produce a reconciliation table mapping every scanner finding to its merged counterpart.

## Inputs

### scanner_outputs

The per-submodule scanner [output files](../resources/sub-agent-output-schema.md#schema), one per scanner agent

## Protocol

### 1. Load All Outputs

- Load each of the `{scanner_outputs}` JSON files and extract its findings array

### 2. Deduplicate

- Group findings by (file_path, line_range, pattern_id)
- For duplicates, keep the finding with the most complete evidence
- Record `{$duplicate_mappings}` for reconciliation

### 3. Cross Pattern Correlation

- Group remaining findings by workflow file
- Identify compound chains where multiple patterns affect the same workflow
- Create compound findings that capture the full attack chain (e.g., P2+P1+P4 = Pwn Request with expression injection and excessive permissions)
- Compound chains must preserve all constituent pattern evidence

### 4. Reconcile

- Build reconciliation table from `{duplicate_mappings}`, mapping every original scanner finding to its merged finding number
- Verify Unaccounted equals zero for every scanner
- Every scanner finding must map to a merged finding or be marked duplicate

### 5. Write Output

- Produce the `{merged_findings}` and the reconciliation table

## Outputs

### merged_findings

Unified [finding set](../resources/intermediate-artifact-schemas.md#merged-findings)

#### findings

Deduplicated and correlated findings

#### compounds

Compound vulnerability chains

#### observations

Informational items without clear source-to-sink flow

### reconciliation

Per-scanner finding mapping to merged findings — the [reconciliation table](../resources/intermediate-artifact-schemas.md#reconciliation)

## Rules

### observation-retention

Observations are preserved even if they don't rise to finding level
