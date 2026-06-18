---
metadata:
  version: 1.0.0
---

## Capability

Identify the root cause of a single failed validation check.

## Inputs

### check_id

Identifier of the failed check (one of: `run-tests`, `verify-build`, `check-format`, `check-lint`)

### failure_diagnostics

stdout/stderr or structured diagnostics emitted by the underlying tool

### target_path

Working directory the failed check ran against; `file:line` citations in the diagnostics resolve relative to it.

## Outputs

### root_cause

One-line statement of the root cause

### fix_strategy

Concrete fix approach (file edit, `fmt-fix` invocation, dependency install, etc.)

## Protocol

1. Parse the `{failure_diagnostics}` for the failed `{check_id}` and classify into `{$failure_class}`. Compile and test failures cite a `file:line` — resolve that location against `{target_path}` and read it via the harness Read tool.
   - If the `{failure_diagnostics}` do not pinpoint a file or symbol, surface the raw `{failure_diagnostics}` to the user rather than guessing.
2. Distinguish flaky from real failures by inspecting the diagnostic surface (e.g., timing-related panics, network errors); mark flaky only when there is a clear signal. Settle on the `{root_cause}` — a one-line statement of why the check failed.
3. Map `{failure_class}` to `{fix_strategy}`: `compile-error` / `test-assertion` → source edit; `formatting-diff` → [cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md)::[fmt-fix](../../../meta/techniques/cargo-operations/fmt-fix.md); `lint-violation` → either source edit or an explicit allow with justification; `environment` → surface to the user (do not auto-install). When the `{failure_diagnostics}` indicate a missing toolchain, dependency, or external service, refer the user to the project's setup instructions; do not attempt to install or configure the toolchain.
