Combine per-check outcomes into a single `validation_results` envelope.

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

{ test_results, build_status, format_status, lint_results, validation_passed } — `validation_passed` is true iff ALL inputs passed

## Protocol

1. Compute `validation_passed = test_results.passed AND build_status.passed AND format_status.passed AND lint_results.passed`.
2. Emit the envelope; do not mutate any input.
