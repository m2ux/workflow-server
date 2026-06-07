---
metadata:
  version: 1.0.0
---

## Capability

Type-check without producing binaries; the cheapest validation pass.

## Output

### check_status

Pass/fail and the rustc diagnostics emitted

## Protocol

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo check {scope} {features}`; the command's exit code and rustc diagnostics are the `{check_status}`.
   - If the compile peaks above available RAM even with the job budget, halve `CARGO_BUILD_JOBS` (`export CARGO_BUILD_JOBS=2`) and retry; if it still fails, narrow scope to `-p <crate>`.
   - If the type-check fails in the source, address the rustc errors and retry.
