---
metadata:
  version: 1.0.0
---

## Capability

Identify the root cause of a single failed validation check.

## Inputs

### check_id

Identifier of the failed check (one of: run-tests, verify-build, check-format, check-lint)

### diagnostics

stdout/stderr or structured diagnostics emitted by the underlying tool

### target_path

Path the check ran against (used to read source files referenced in diagnostics)

## Output

### failure_class

One of: compile-error, test-assertion, lint-violation, formatting-diff, environment, flaky

### root_cause

One-line statement of the root cause

### fix_strategy

Concrete fix approach (file edit, fmt-fix invocation, dependency install, etc.)

## Protocol

1. Parse the diagnostics for the failed `check_id` and classify into `failure_class`. Compile and test failures cite a file:line — resolve that location against `target_path` and read it via the harness Read tool.
2. Distinguish flaky from real failures by inspecting the diagnostic surface (e.g., timing-related panics, network errors); mark flaky only when there is a clear signal. Settle on the `root_cause` — a one-line statement of why the check failed.
3. Map `failure_class` to `fix_strategy`: compile-error / test-assertion → source edit; formatting-diff → [cargo-operations](../cargo-operations/TECHNIQUE.md)::[fmt-fix](../cargo-operations/fmt-fix.md); lint-violation → either source edit or an explicit allow with justification; environment → surface to the user (do not auto-install).

## Errors

### ambiguous_diagnostics

**Cause:** Diagnostics do not pinpoint a file or symbol

**Recovery:** Surface raw diagnostics to the user as a checkpoint via the activity

### build_environment

**Cause:** Diagnostics indicate a missing toolchain, dependency, or external service

**Recovery:** Refer the user to the project's setup instructions; do not attempt to install or configure toolchain
