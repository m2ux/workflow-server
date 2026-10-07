---
metadata:
  version: 1.0.0
---

## Capability

Record an artifact at an explicitly bound destination directory.

## Inputs

### artifact_destination

The directory where the artifact must land.

#### default

`.`

## Outputs

### bound_report

The conformance report written to the bound destination directory.

#### artifact

`bound-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Format the Report

- Format the report according to [Template](../resources/conformance-report.md#template).

### 2. Write to Destination

- Write `{bound_report}` to `{artifact_destination}/bound-conformance-report.md`.
- Confirm no session state file (`session.json`, `.session-token`) is written to `{artifact_destination}`.
