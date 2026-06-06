---
metadata:
  version: 1.0.0
---

## Capability

Run the linter against all targets, denying warnings.

## Output

### clippy_status

{ passed: boolean } — true when no denied warnings emitted

### lint_diagnostics

Captured stdout/stderr from the linter run

## Protocol

1. Run `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo clippy {scope} --all-targets {features} -- -D warnings`, capturing its combined stdout/stderr as `lint_diagnostics`.
2. Set `clippy_status` to `{ passed: true }` when the run exits cleanly with no denied warnings; otherwise `{ passed: false }`, surfacing the offending entries from `lint_diagnostics`. If clippy emitted denied warnings, address the diagnostics; do not blanket-allow without justification.
