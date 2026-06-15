---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Compile all gaps and the per-file/per-pattern status into the gap report with coverage status and re-scan recommendations, recording the report as complete only when zero gaps remain.

## Outputs

### verification_complete

true when the gap report finds zero gaps.

## Protocol

### 1. Produce Gap Report

- Compile all gaps into `{verification_report.gaps}` and the per-file/per-pattern status into `{verification_report.file_coverage}` and `{verification_report.pattern_coverage}`.
- Record `{verification_report}` as complete only when zero gaps are found, and set `{verification_complete}` to true when the gap report finds zero gaps.
