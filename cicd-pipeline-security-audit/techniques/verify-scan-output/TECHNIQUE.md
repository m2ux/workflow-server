---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Verify scan completeness by cross-referencing all scanner outputs against the workflow file inventory and pattern catalog, identifying gaps (unscanned files, skipped patterns, malformed output) and producing a gap report to drive targeted re-scan. The operations in this set decompose that verification into structural validation, file-coverage, pattern-coverage, and gap-report phases.

## Inputs

### scanner_outputs

The per-submodule scanner [output files](../../resources/sub-agent-output-schema.md#schema), one per scanner agent

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with classification data

## Outputs

### verification_report

Scan completeness [verification](../../resources/intermediate-artifact-schemas.md#verification-report) with gaps and re-scan recommendations

#### artifact

`verification-report.json`

#### file_coverage

Scanned vs total files

#### pattern_coverage

Per-scanner pattern application status

#### gaps

List of unscanned files or skipped patterns

#### recommendation

Re-scan targets if gaps exist
