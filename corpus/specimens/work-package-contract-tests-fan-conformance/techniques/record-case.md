---
metadata:
  version: 1.0.0
---

## Capability

Append the join outcome.

## Inputs

### contract_tests_fail_on_base

Whether the join confirmed a red suite.

### contract_tests_path

Path hoisted from the contract-tests branch.

### contract_tests_branch

Branch hoisted from the contract-tests branch.

### case_outcomes

Outcomes so far.

## Outputs

### case_outcomes

List with this case appended.

## Protocol

### 1. Record

- Append `{contract_tests_fail_on_base}`, `{contract_tests_path}`, `{contract_tests_branch}` to `{case_outcomes}`
