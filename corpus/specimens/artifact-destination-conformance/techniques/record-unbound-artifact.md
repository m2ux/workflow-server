---
metadata:
  version: 1.0.0
---

## Capability

Record an artifact without an explicit destination, defaulting to the session planning directory.

## Outputs

### unbound_report

The conformance report written to the planning directory.

#### artifact

`unbound-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Format the Report

- Format the report according to [Template](../resources/conformance-report.md#template).

### 2. Write to Planning Folder

- Write `{unbound_report}` under `{planning_folder_path}/unbound-conformance-report.md`.
