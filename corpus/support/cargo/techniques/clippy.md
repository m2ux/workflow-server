---
metadata:
  version: 1.1.0
---

## Capability

Run the linter against all targets, denying warnings.

## Outputs

### clippy_status

`{ check_id: 'clippy', passed: boolean, diagnostics }` — `passed` is true when no denied warnings emitted; `diagnostics` is `{lint_diagnostics}`.

### lint_diagnostics

Captured stdout/stderr from the linter run.

## Protocol

1. Run `{generated_product_skip} {build_budget} cargo clippy {build_scope} --all-targets {features} -- -D warnings`, capturing its combined stdout/stderr as `{lint_diagnostics}`.
2. Compose `{clippy_status}` = `{ check_id: 'clippy', passed: <run exited cleanly with no denied warnings>, diagnostics: {lint_diagnostics} }`.
   > When `passed` is false, surface the offending entries from `{lint_diagnostics}` and address them. A blanket allow carries a stated justification.
