---
metadata:
  version: 1.2.0
---

## Capability

Run tests with bounded test parallelism; prefer nextest when configured.

## Inputs

### test_filter

*(optional)* Test name filter, e.g. `test_foo` or `--test integration`.

#### default

`''`

## Outputs

### test_status

`{ check_id: 'test', passed: boolean, diagnostics }` — `passed` is true when every test passed; `diagnostics` is `{failures}`.

### failures

Per-test failure detail, empty when every test passed.

## Protocol

1. Run the test suite, capturing its per-test failure detail as `{failures}`.
   > - Where `.config/nextest.toml` is present: `{generated_product_skip} RUST_TEST_THREADS=${RUST_TEST_THREADS:-4} {build_budget} cargo nextest run {build_scope} {features} --test-threads=${RUST_TEST_THREADS:-4} {test_filter}`
   > - Otherwise: `{generated_product_skip} RUST_TEST_THREADS=${RUST_TEST_THREADS:-4} {build_budget} cargo test {build_scope} {features} {test_filter} -- --test-threads=${RUST_TEST_THREADS:-4}`
   > - When test compilation or runtime peaks above available RAM, halve `CARGO_BUILD_JOBS` and `RUST_TEST_THREADS` and retry.
2. Compose `{test_status}` = `{ check_id: 'test', passed: <every test passed>, diagnostics: {failures} }`.

## Rules

### nextest-where-configured

Where `.config/nextest.toml` is present, the run goes through nextest. It isolates failures into separate processes, so the peak is lower and the report names which test failed.

### failures-are-not-masked

A reported failure is investigated as reported. `--no-fail-fast` does not appear in either invocation, because a suite that hides its first failure returns a verdict this operation cannot compose.
