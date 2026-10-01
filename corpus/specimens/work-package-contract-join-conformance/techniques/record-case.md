---
metadata:
  version: 1.0.0
---

## Capability

Append the join outcome for the case.

## Inputs

### case_kind

Which case was walked.

### contract_tests_passed

Whether the suite passed.

### join_exit

Exit the join took.

### case_outcomes

Outcomes so far.

## Outputs

### case_outcomes

List with this case appended.

## Protocol

### 1. Record

- Append `{case_kind}`, `{contract_tests_passed}`, and `{join_exit}` to `{case_outcomes}`
