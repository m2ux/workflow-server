---
metadata:
  version: 1.0.0
---

## Capability

Run the linter against all targets, denying warnings.

## Output

### clippy-status

{ passed: boolean } — true when no denied warnings emitted

### lint-diagnostics

Captured stdout/stderr from the linter run

## Protocol

1. Run `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo clippy {scope} --all-targets {features} -- -D warnings`, capturing its combined stdout/stderr as `lint-diagnostics`.
2. Set `clippy-status` to `{ passed: true }` when the run exits cleanly with no denied warnings; otherwise `{ passed: false }`, surfacing the offending entries from `lint-diagnostics`. If clippy emitted denied warnings, address the diagnostics; do not blanket-allow without justification.
