---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Verify scan completeness by cross-referencing all scanner outputs against the workflow file inventory and pattern catalog, identifying gaps (unscanned files, skipped patterns, malformed output) and producing a gap report to drive targeted re-scan.

## Inputs

### scanner-outputs

The per-submodule scanner [output files](../resources/sub-agent-output-schema.md#schema), one per scanner agent

### workflow-inventory

Complete [inventory of workflow files](../resources/intermediate-artifact-schemas.md#workflow-inventory) with classification data

### output-schema

Expected scanner output schema from [sub-agent-output-schema](../resources/sub-agent-output-schema.md)

## Protocol

### 1. Validate Structure

- Load each of the `scanner-outputs` JSON files
- Validate each against the `output-schema` — flag malformed or missing fields
- Malformed outputs count as gaps

### 2. Verify File Coverage

- Build set of all scanned files across all `scanner-outputs`
- Diff against the `workflow-inventory` — identify unscanned files

### 3. Verify Pattern Coverage

- For each scanner output, check the coverage section for all seven patterns (P1-P7)
- Flag any scanner that reports incomplete pattern application

### 4. Produce Gap Report

- Compile all gaps into the {verification-report}
- Set verification-complete=true only if zero gaps found

## Outputs

### verification-report

Scan completeness [verification](../resources/intermediate-artifact-schemas.md#verification-report) with gaps and re-scan recommendations

#### file-coverage

Scanned vs total files

#### pattern-coverage

Per-scanner pattern application status

#### gaps

List of unscanned files or skipped patterns

#### recommendation

Re-scan targets if gaps exist
