---
metadata:
  version: 1.0.0
---

## Capability

Type-check without producing binaries; the cheapest validation pass.

## Inputs

### build_scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate.

### features

Optional `--features` flags (empty string when none).

## Outputs

### check_status

`{ check_id: 'check', passed: boolean, diagnostics }` — `passed` is true when the type-check exits cleanly; `diagnostics` is the rustc output emitted. This is the shape [run-suite](./run-suite.md) folds into its `validation_results` envelope.

## Protocol

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo check {build_scope} {features}`; compose `{check_status}` = `{ check_id: 'check', passed: <exit code 0>, diagnostics: <rustc output> }`.
   - If the compile peaks above available RAM even with the job budget, halve `CARGO_BUILD_JOBS` (`export CARGO_BUILD_JOBS=2`) and retry; if it still fails, narrow scope to `-p <crate>`.
   - If the type-check fails in the source, address the rustc errors and retry.
