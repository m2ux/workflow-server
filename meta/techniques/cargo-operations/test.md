---
metadata:
  version: 1.1.0
---

## Capability

Run tests with bounded test parallelism; prefer nextest when configured.

## Inputs

### test_filter

Optional test name filter (e.g., `test_foo` or `--test integration`); empty string when none


## Outputs

### test_status

Pass/fail summary

### failures

Per-test failure detail when any failed

## Protocol

1. If cargo nextest is configured (`.config/nextest.toml` present in the project): `{generated_product_skip} RUST_TEST_THREADS=${RUST_TEST_THREADS:-4} {build_budget} cargo nextest run {build_scope} {features} --test-threads=${RUST_TEST_THREADS:-4} {test_filter}`  
   > When cargo nextest is configured (`.config/nextest.toml` present), this operation MUST use the nextest branch — it isolates failures into separate processes, giving lower peak RAM and clearer reporting. The procedure's conditional encodes this: do not skip the nextest branch when it applies.
2. Otherwise: `{generated_product_skip} RUST_TEST_THREADS=${RUST_TEST_THREADS:-4} {build_budget} cargo test {build_scope} {features} {test_filter} -- --test-threads=${RUST_TEST_THREADS:-4}`
   > If test compilation or runtime peaks above available RAM, halve `CARGO_BUILD_JOBS` and `RUST_TEST_THREADS` and retry; consider the nextest branch for lower per-test peak.
3. Report the run's pass/fail summary as `{test_status}`; when any test failed, capture the per-test detail as `{failures}`. If one or more tests failed, investigate the reported failure; do not mask it via `--no-fail-fast`.
