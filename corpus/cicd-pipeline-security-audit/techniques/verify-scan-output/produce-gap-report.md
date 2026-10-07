---
metadata:
  version: 1.1.0
---

## Capability

Compile all gaps and the per-file/per-pattern status into the gap report with coverage status and re-scan recommendations, recording the report as complete only when zero gaps remain.

## Outputs

### verification_report

Scan completeness [verification](../../resources/intermediate-artifact-schemas.md#verification-report) with gaps and re-scan recommendations.

#### artifact

`verification-report.json`

#### audience

`agent`

#### file_coverage

Scanned vs total files.

#### pattern_coverage

Per-scanner pattern application status.

#### gaps

List of unscanned files or skipped patterns.

#### recommendation

Re-scan targets if gaps exist.

### verification_complete

true when the gap report finds zero gaps.

## Protocol

### 1. Produce Gap Report

- Compile all gaps into `{verification_report.gaps}` and the per-file/per-pattern status into `{verification_report.file_coverage}` and `{verification_report.pattern_coverage}`.
- Record `{verification_report}` as complete only when zero gaps are found, and set `{verification_complete}` to true when the gap report finds zero gaps.
