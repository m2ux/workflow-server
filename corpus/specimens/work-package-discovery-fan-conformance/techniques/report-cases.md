---
metadata:
  version: 1.0.0
---

## Capability

State what the discovery fan landed in each case.

## Inputs

### case_outcomes

One outcome per case walked.

## Outputs

### discovery_fan_case_report

What the fan landed in each case, shaped by [Template](../resources/discovery-fan-case-report.md#template).

#### artifact

`work-package-discovery-fan-cases.md`

#### audience

`human`

## Protocol

### 1. Write Report

- Fill one row per entry of `{case_outcomes}` per [Template](../resources/discovery-fan-case-report.md#template).
- Write `{discovery_fan_case_report}` to `{planning_folder_path}`.
