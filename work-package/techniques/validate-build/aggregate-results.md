---
metadata:
  version: 1.0.0
---

## Capability

Combine per-check outcomes into a single `validation-results` envelope.

## Inputs

### test_results

Pass/fail and output from running the test suite

### build_status

Pass/fail from the build or type-check step

### format_status

Pass/fail from the format check

### lint_results

Pass/fail and output from the linter

## Output

### validation_results

{ test-results, build-status, format-status, lint-results, validation_passed } — `validation_passed` is true iff ALL inputs passed

## Protocol

1. Compute `validation_passed = test-results.passed AND build-status.passed AND format-status.passed AND lint-results.passed`.
2. Emit the `validation-results` envelope carrying each input outcome plus `validation_passed`; do not mutate any input.
