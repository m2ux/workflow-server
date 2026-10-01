---
metadata:
  version: 1.0.0
---

## Capability

Write the contract-join case report.

## Inputs

### case_outcomes

One outcome per case.

## Outputs

### contract_join_case_report

Report shaped by [Template](../resources/contract-join-case-report.md#template).

#### artifact

`work-package-contract-join-cases.md`

#### audience

`human`

## Protocol

### 1. Write

- Fill one row per `{case_outcomes}` entry
- Write to `{planning_folder_path}`
