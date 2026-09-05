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

## Outputs

### root_cause

One-line statement of the root cause

### fix_strategy

Concrete fix approach (file edit, `fmt-fix` invocation, dependency install, etc.)

## Protocol

1. Parse the `{failure_diagnostics}` for the failed `{check_id}` and classify into `{$failure_class}`. Compile and test failures cite a `file:line` — resolve that location against `{target_path}` and read it via the harness Read tool.
   > Where the `{failure_diagnostics}` do not pinpoint a file or symbol, `{root_cause}` records that the diagnostics are unlocalised — never a guessed location.
2. Distinguish flaky from real failures by inspecting the diagnostic surface (e.g., timing-related panics, network errors); mark flaky only when there is a clear signal. Settle on the `{root_cause}` — a one-line statement of why the check failed.
3. Map `{failure_class}` to `{fix_strategy}`: `compile-error` / `test-assertion` → source edit; `formatting-diff` → [cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md)::[fmt-fix](../../../meta/techniques/cargo-operations/fmt-fix.md); `lint-violation` → either source edit or an explicit allow with justification; `environment` → `{fix_strategy}` records that the check needs a toolchain, dependency, or external service the run neither installs nor configures, and names the project's setup instructions as where it is obtained.
