Combine per-check outcomes into a single `validation_results` envelope.

## Inputs

### test_results

Pass/fail and output captured from [cargo-operations](../cargo-operations/TECHNIQUE.md)::[test](../cargo-operations/test.md) (or the project-equivalent test command)

### build_status

Pass/fail captured from [cargo-operations](../cargo-operations/TECHNIQUE.md)::[check](../cargo-operations/check.md) or [cargo-operations](../cargo-operations/TECHNIQUE.md)::[build-release](../cargo-operations/build-release.md) (or the project-equivalent build command)

### format_status

Pass/fail captured from [cargo-operations](../cargo-operations/TECHNIQUE.md)::[fmt-check](../cargo-operations/fmt-check.md) (or the project-equivalent format check)

### lint_results

Pass/fail and output captured from [cargo-operations](../cargo-operations/TECHNIQUE.md)::[clippy](../cargo-operations/clippy.md) (or the project-equivalent linter)

## Output

### validation_results

{ test_results, build_status, format_status, lint_results, validation_passed } — `validation_passed` is true iff ALL inputs passed

## Protocol

1. Compute `validation_passed = test_results.passed AND build_status.passed AND format_status.passed AND lint_results.passed`.
2. Emit the envelope; do not mutate any input.
