---
metadata:
  version: 1.0.0
---

## Capability

Run the linter against all targets, denying warnings.

## Inputs

### build_scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate.

### features

Optional `--features` flags (empty string when none).

## Outputs

### clippy_status

`{ check_id: 'clippy', passed: boolean, diagnostics }` — `passed` is true when no denied warnings emitted; `diagnostics` is `{lint_diagnostics}`. This is the shape [run-suite](./run-suite.md) folds into its `validation_results` envelope.

### lint_diagnostics

Captured stdout/stderr from the linter run.

## Protocol

1. Run `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo clippy {build_scope} --all-targets {features} -- -D warnings`, capturing its combined stdout/stderr as `{lint_diagnostics}`.
2. Compose `{clippy_status}` = `{ check_id: 'clippy', passed: <run exited cleanly with no denied warnings>, diagnostics: {lint_diagnostics} }`. When `passed` is false, surface the offending entries from `{lint_diagnostics}`. If clippy emitted denied warnings, address the diagnostics; do not blanket-allow without justification.
