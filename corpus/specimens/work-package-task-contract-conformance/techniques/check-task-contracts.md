---
metadata:
  version: 1.0.0
---

## Capability

Verify every task in the case's plan carries a complete Contract.

## Inputs

### plan_path

Path of the plan written for the case.

## Outputs

### contract_check_held

True when every Implementation Task carries Signatures, Behaviours, Error cases and Acceptance.

### contract_check_missing

The Contract field names absent from any task; empty when the check holds.

## Protocol

### 1. Check Contracts

- Read the plan at `{plan_path}`
- For each `### Task` heading under Implementation Tasks, confirm its Contract block names Signatures, Behaviours, Error cases and Acceptance
- Set `{contract_check_held}` true when every task carries all four fields; otherwise false
- Set `{contract_check_missing}` to the field names absent from any task
