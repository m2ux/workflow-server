---
metadata:
  version: 1.1.0
---

## Capability

Append this case's contract-test outcome.

## Inputs

### case_kind

Which case was walked.

### contract_tests_passed

Whether the suite passed.

### join_exit

The exit this case took.

### case_outcomes

Outcomes so far.

## Outputs

### case_outcomes

List with this case appended.

## Protocol

### 1. Record

- Append `{case_kind}`, `{contract_tests_passed}`, and `{join_exit}` to `{case_outcomes}`
