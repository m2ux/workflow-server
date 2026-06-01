---
name: merge-scan-findings
description: Merge skill for the CI/CD pipeline security audit. Loads all scanner outputs, deduplicates findings (same file, same line, same pattern), identifies compound vulnerability chains (multiple patterns converging on one workflow), and produces a reconciled unified finding set. The reconciliation table maps every scanner finding to its merged counterpart.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Merge, deduplicate, and correlate findings from multiple scanner agents into a unified finding set

## Inputs

### scanner-outputs

Paths to all s{n}-{submodule}.json output files

## Protocol

### 1. Load All Outputs

- Load every scanner output JSON and extract the findings array

### 2. Deduplicate

- Group findings by (file_path, line_range, pattern_id)
- For duplicates, keep the finding with the most complete evidence
- Record duplicate mappings for reconciliation

### 3. Cross Pattern Correlation

- Group remaining findings by workflow file
- Identify compound chains where multiple patterns affect the same workflow
- Create compound findings that capture the full attack chain (e.g., P2+P1+P4 = Pwn Request with expression injection and excessive permissions)
- Compound chains must preserve all constituent pattern evidence

### 4. Reconcile

- Build reconciliation table mapping every original scanner finding to its merged finding number
- Verify Unaccounted equals zero for every scanner
- Every scanner finding must map to a merged finding or be marked duplicate

### 5. Write Output

- Produce merged-findings.json and reconciliation-table.json

## Outputs

### merged-findings

Unified finding set

- **findings**: Deduplicated and correlated findings
- **compounds**: Compound vulnerability chains
- **observations**: Informational items without clear source-to-sink flow

### reconciliation

Per-scanner finding mapping to merged findings

## Rules

### observation-retention

Observations are preserved even if they don't rise to finding level
