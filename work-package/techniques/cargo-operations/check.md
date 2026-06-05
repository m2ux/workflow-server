---
metadata:
  version: 1.0.0
---

## Capability

Type-check without producing binaries; the cheapest validation pass.

## Inputs

### scope

`'--workspace'` for the full workspace, or `'-p <crate>'` to scope to one crate (preferred during inner loops)

### features

Optional --features flags (empty string when none)

## Output

### check_status

Pass/fail and the rustc diagnostics emitted

## Protocol

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo check {scope} {features}`; the command's exit code and rustc diagnostics are the `check_status`.

## Errors

### out_of_memory

**Cause:** Compile peaked above available RAM even with the budget

**Recovery:** Halve CARGO_BUILD_JOBS (export CARGO_BUILD_JOBS=2) and retry; if still failing, narrow scope to -p <crate>

### compile_error

**Cause:** Type-check failed in the source

**Recovery:** Address the rustc errors and retry
