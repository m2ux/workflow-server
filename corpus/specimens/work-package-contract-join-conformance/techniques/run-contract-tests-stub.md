---
metadata:
  version: 1.1.0
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

Empty when `{case_kind}` is `pass`; otherwise one failure, `Acceptance: caller receives true`.

## Protocol

### 1. Run

- Emit `{contract_tests_passed}` and `{contract_test_failures}`
