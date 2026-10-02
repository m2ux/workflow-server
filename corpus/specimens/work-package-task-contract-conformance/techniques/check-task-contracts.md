---
metadata:
  version: 1.1.0
---

## Capability

Verify every task in the case's plan carries a complete Contract.

## Inputs

### plan_document

The plan written for the case.

## Outputs

### contract_check_held

True when every Implementation Task carries Signatures, Behaviours, Error cases and Acceptance.

### contract_check_missing

The Contract field names absent from any task; empty when the check holds.

## Protocol

### 1. Check Contracts

- Read `{plan_document}`
- For each `### Task` heading under Implementation Tasks, read its Contract block
- Emit `{contract_check_held}` and `{contract_check_missing}`
