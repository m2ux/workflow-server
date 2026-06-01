---
name: verify-scan-output
description: Verification technique for the CI/CD pipeline security audit. Cross-references scanner outputs against the workflow file inventory and pattern catalog to ensure complete coverage. Identifies gaps (unscanned files, skipped patterns, malformed output) and produces a gap report to drive targeted re-scan.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Verify scan completeness across all scanner outputs and produce gap report

## Inputs

### scanner-outputs

Paths to all s{n}-{submodule}.json output files

### workflow-inventory

Complete workflow file inventory from scope-setup

### output-schema

Expected scanner output schema from [sub-agent-output-schema](../resources/sub-agent-output-schema.md)

## Protocol

### 1. Validate Structure

- Load each scanner output JSON
- Validate against the output schema — flag malformed or missing fields
- Malformed outputs count as gaps

### 2. Verify File Coverage

- Build set of all scanned files across all scanner outputs
- Diff against the workflow file inventory — identify unscanned files

### 3. Verify Pattern Coverage

- For each scanner output, check the coverage section for all seven patterns (P1-P7)
- Flag any scanner that reports incomplete pattern application

### 4. Produce Gap Report

- Compile all gaps into verification-report.json
- Set verification_complete=true only if zero gaps found
- verification_complete is only set when file and pattern coverage are both 100%

## Outputs

### verification-report

Scan completeness verification with gaps and re-scan recommendations

- **file_coverage**: Scanned vs total files
- **pattern_coverage**: Per-scanner pattern application status
- **gaps**: List of unscanned files or skipped patterns
- **recommendation**: Re-scan targets if gaps exist
