---
metadata:
  version: 1.0.0
---

## Capability

Run tests with bounded test parallelism; prefer nextest when configured.

## Inputs

### scope

`'--workspace'` or `'-p <crate>'`

### features

Optional --features flags (empty string when none)

### test_filter

Optional test name filter (e.g., 'test_foo' or '--test integration'); empty string when none

## Output

### test_status

Pass/fail summary

### failures

Per-test failure detail when any failed

## Protocol

1. If cargo nextest is configured (.config/nextest.toml present in the project): `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo nextest run {scope} {features} --test-threads=${RUST_TEST_THREADS:-4} {test_filter}`
2. Otherwise: `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo test {scope} {features} {test_filter} -- --test-threads=${RUST_TEST_THREADS:-4}`
3. Report the run's pass/fail summary as `test_status`; when any test failed, capture the per-test detail as `failures`.

## Errors

### out_of_memory

**Cause:** Test compile or test runtime peaked above available RAM

**Recovery:** Halve CARGO_BUILD_JOBS and RUST_TEST_THREADS and retry; consider nextest for lower per-test peak

### test_failure

**Cause:** One or more tests failed

**Recovery:** Investigate the reported failure; do not mask via --no-fail-fast

## Rules

### prefer-nextest

When cargo nextest is configured for the project (`.config/nextest.toml` present), this operation MUST use the nextest branch — it isolates failures into separate processes, giving lower peak RAM and clearer reporting. The procedure's conditional encodes this: do not skip the nextest branch when it applies.
