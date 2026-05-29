# clippy

Run the linter against all targets, denying warnings.

## Inputs

### scope

`'--workspace'` or `'-p <crate>'`

### features

Optional --features flags (empty string when none)

## Output

### clippy_status

{ passed: boolean } — true when no denied warnings emitted

### lint_diagnostics

Captured stdout/stderr (used by [validate-build](../validate-build/SKILL.md)::[analyze-failure](../validate-build/analyze-failure.md))

## Procedure

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo clippy {scope} --all-targets {features} -- -D warnings`

## Errors

### lint_violations

**Cause:** clippy emitted denied warnings

**Recovery:** Address the diagnostics; do not blanket-allow without justification
