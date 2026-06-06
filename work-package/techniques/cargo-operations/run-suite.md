---
metadata:
  version: 1.0.0
---

## Capability

Run check, clippy, test, and fmt-check concurrently against the same scope and aggregate their statuses into a single validation-results envelope. Replaces the four serial validate-class operations and is the canonical entry point for the validate activity on rust-substrate projects.

## Output

### validation_results

The aggregate validation envelope from the four concurrent ops:

#### check_status

status of the [check](./check.md) op (`{ passed }`).

#### clippy_status

status of the [clippy](./clippy.md) op (`{ passed }`).

#### test_status

status of the [test](./test.md) op (`{ passed }`).

#### fmt_status

status of the [fmt-check](./fmt-check.md) op (`{ passed }`).

#### validation_passed

aggregate verdict — true iff all four per-op statuses passed.

## Protocol

1. Fan out four concurrent shells invoking [check](./check.md), [clippy](./clippy.md), [test](./test.md), and [fmt-check](./fmt-check.md) against the same {scope}, passing the same {features} flags to each compiling op. Each carries its own resource budget (nice -n 19 + CARGO_BUILD_JOBS cap), so suite peak memory is bounded by the per-op cap, NOT by 4× a single op (fmt-check uses no compile budget at all). If the combined peak of the concurrent cargo invocations still exceeds available RAM despite the per-op budgets, halve CARGO_BUILD_JOBS for all (export CARGO_BUILD_JOBS=2) and retry; on very tight hosts, fall back to running check/clippy/test sequentially via the per-op operations.
2. Wait for ALL four to finish before composing results. Do NOT short-circuit on the first failure — collect every per-op status and diagnostics so a single pass surfaces every issue rather than forcing serial discovery.
3. Compose {validation_results} = { {check_status}, {clippy_status}, {test_status}, {fmt_status}, {validation_passed}: {check_status}.passed AND {clippy_status}.passed AND {test_status}.passed AND {fmt_status}.passed }.