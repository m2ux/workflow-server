---
metadata:
  version: 1.2.0
---

## Capability

Type-check without producing binaries; the cheapest validation pass.

## Outputs

### check_status

`{ check_id: 'check', passed: boolean, diagnostics }` — `passed` is true when the type-check exits cleanly; `diagnostics` is `{check_diagnostics}`.

### check_diagnostics

Captured rustc output from the type-check run.

## Protocol

1. Run `{generated_product_skip} {build_budget} cargo check {build_scope} {features}`, capturing its combined stdout/stderr as `{check_diagnostics}`.
   > - When the compile peaks above available RAM even with the job budget, halve `CARGO_BUILD_JOBS` (`export CARGO_BUILD_JOBS=2`) and retry; where it still fails, narrow `{build_scope}` to one crate.
   > - When the type-check fails in the source, address the rustc errors and retry.
2. Compose `{check_status}` = `{ check_id: 'check', passed: <exit code 0>, diagnostics: {check_diagnostics} }`.
