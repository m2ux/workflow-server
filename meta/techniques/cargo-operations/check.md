---
metadata:
  version: 1.1.0
---

## Capability

Type-check without producing binaries; the cheapest validation pass.

## Outputs

### check_status

`{ check_id: 'check', passed: boolean, diagnostics }` — `passed` is true when the type-check exits cleanly; `diagnostics` is the rustc output emitted.

## Protocol

1. `{generated_product_skip} {build_budget} cargo check {build_scope} {features}`; compose `{check_status}` = `{ check_id: 'check', passed: <exit code 0>, diagnostics: <rustc output> }`.
   > - If the compile peaks above available RAM even with the job budget, halve `CARGO_BUILD_JOBS` (`export CARGO_BUILD_JOBS=2`) and retry; if it still fails, narrow scope to `-p <crate>`.
   > - If the type-check fails in the source, address the rustc errors and retry.
