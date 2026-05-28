# test

Run tests with bounded test parallelism; prefer nextest when configured.

## Inputs

- **scope** — `'--workspace'` or `'-p <crate>'`
- **features** — Optional --features flags (empty string when none)
- **test_filter** — Optional test name filter (e.g., 'test_foo' or '--test integration'); empty string when none

## Output

- **test_status** — Pass/fail summary
- **failures** — Per-test failure detail when any failed

## Procedure

- If cargo nextest is configured (.config/nextest.toml present in the project): `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo nextest run {scope} {features} --test-threads=${RUST_TEST_THREADS:-4} {test_filter}`
- Otherwise: `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo test {scope} {features} {test_filter} -- --test-threads=${RUST_TEST_THREADS:-4}`

## Tools

- **shell:** cargo

## Errors

- **out_of_memory** — Cause: Test compile or test runtime peaked above available RAM · Recovery: Halve CARGO_BUILD_JOBS and RUST_TEST_THREADS and retry; consider nextest for lower per-test peak
- **test_failure** — Cause: One or more tests failed · Recovery: Investigate the reported failure; do not mask via --no-fail-fast
