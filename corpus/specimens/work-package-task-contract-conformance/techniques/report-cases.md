---
metadata:
  version: 1.0.0
---

## Capability

State what each Contract check landed.

## Inputs

### case_outcomes

One outcome per case walked.

## Outputs

### task_contract_case_report

What each case's Contract check landed, shaped by [Template](../resources/task-contract-case-report.md#template).

#### artifact

`work-package-task-contract-cases.md`

#### audience

`human`

## Protocol

### 1. Write Report

- Fill one row per entry of `{case_outcomes}` per [Template](../resources/task-contract-case-report.md#template)
- Write `{task_contract_case_report}` to `{planning_folder_path}`
