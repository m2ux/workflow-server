---
metadata:
  version: 1.2.1
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

The list with this case appended: which case was walked, whether the suite passed, and the exit the case took.

## Protocol

### 1. Record

- Append this case to `{case_outcomes}` from `{case_kind}`, `{contract_tests_passed}`, and `{join_exit}`
