---
metadata:
  version: 1.0.0
---

## Capability

Stub run of merged contract tests — green on pass, red otherwise.

## Inputs

### case_kind

`pass`, `rework`, or `dispute`.

## Outputs

### contract_tests_passed

True only when `{case_kind}` is `pass`.

### contract_test_failures

Empty on pass; one failure naming Acceptance otherwise.

## Protocol

### 1. Run

- When `{case_kind}` is `pass`, set `{contract_tests_passed}` true and `{contract_test_failures}` to `[]`
- Otherwise set `{contract_tests_passed}` false and `{contract_test_failures}` to `["Acceptance: caller receives true"]`
