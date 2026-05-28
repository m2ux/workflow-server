# run-suite

Run check, clippy, test, and fmt-check concurrently against the same scope and aggregate their statuses into a single validation_results envelope. Replaces the four serial validate-class operations and is the canonical entry point for the validate activity on rust-substrate projects.

## Inputs

- **scope** — `'--workspace'` for full validation parity with CI; `'-p <crate>'` to scope to one crate (faster but does not match CI)
- **features** — Optional --features flags (empty string when none)

## Output

- **validation_results** — { check_status, clippy_status, test_status, fmt_status, validation_passed } — validation_passed is true iff all four sub-statuses passed

## Procedure

- Fan out four concurrent shells invoking [check](check.md), [clippy](clippy.md), [test](test.md), and [fmt-check](fmt-check.md) against the same {scope}. Each carries its own resource budget (nice -n 19 + CARGO_BUILD_JOBS cap), so suite peak memory is bounded by the per-op cap, NOT by 4× a single op (fmt-check uses no compile budget at all).
- Wait for ALL four to finish before composing results. Do NOT short-circuit on the first failure — collect every per-op status and diagnostics so a single pass surfaces every issue rather than forcing serial discovery.
- Compose validation_results = { check_status, clippy_status, test_status, fmt_status, validation_passed: check_status.passed AND clippy_status.passed AND test_status.passed AND fmt_status.passed }.

## Tools

- **shell:** cargo

## Errors

- **out_of_memory** — Cause: Combined peak of concurrent cargo invocations exceeded available RAM despite per-op budgets · Recovery: Halve CARGO_BUILD_JOBS for all (export CARGO_BUILD_JOBS=2) and retry. On very tight hosts, fall back to running check/clippy/test sequentially via the per-op operations.
