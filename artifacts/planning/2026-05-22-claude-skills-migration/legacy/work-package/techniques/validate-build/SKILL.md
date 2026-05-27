---
name: validate-build
description: Triage validation failures and aggregate cross-check results.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 16
  legacy_id: 16
---

# Validate Build

## Capability

Triage validation failures and aggregate cross-check results for the validate activity

## Operations

### analyze-failure

**Description:** Identify the root cause of a single failed validation check

**Inputs:**

- **check_id** — Identifier of the failed check (one of: run-tests, verify-build, check-format, check-lint)
- **diagnostics** — stdout/stderr or structured diagnostics emitted by the underlying tool
- **target_path** — Path the check ran against (used to read source files referenced in diagnostics)

**Output:**

- **failure_class** — One of: compile-error, test-assertion, lint-violation, formatting-diff, environment, flaky
- **root_cause** — One-line statement of the root cause
- **fix_strategy** — Concrete fix approach (file edit, fmt-fix invocation, dependency install, etc.)

**Procedure:**

- Parse the diagnostics; classify into failure_class. Compile and test failures cite a file:line — read that location via the harness Read tool.
- Distinguish flaky from real failures by inspecting the diagnostic surface (e.g., timing-related panics, network errors). Mark flaky only when there is a clear signal.
- Map failure_class to fix_strategy. compile-error / test-assertion → source edit; formatting-diff → cargo-operations::fmt-fix; lint-violation → either source edit or an explicit allow with justification; environment → surface to the user (do not auto-install).

**Tools:**

- **harness:** Read, Grep

**Errors:**

- **ambiguous_diagnostics** — Cause: Diagnostics do not pinpoint a file or symbol · Recovery: Surface raw diagnostics to the user as a checkpoint via the activity

### apply-fix

**Description:** Apply the chosen fix strategy and prepare for re-validation

**Inputs:**

- **check_id** — Identifier of the originally failed check
- **fix_strategy** — fix_strategy from analyze-failure

**Output:**

- **fix_applied** — Boolean — true if the fix was applied; false if the fix requires user input or external action

**Procedure:**

- Execute the fix per fix_strategy: source edits go through harness Edit/Write; formatting fixes go through cargo-operations::fmt-fix; dependency or environment fixes are surfaced to the user.
- Set fix_applied = true on success. Set fix_applied = false when the fix requires user input — the activity loop will surface this via its checkpoint.

**Tools:**

- **harness:** Edit, Write

### aggregate-results

**Description:** Combine per-check outcomes into a single validation_results envelope

**Inputs:**

- **test_results** — Pass/fail and output captured from cargo-operations::test (or the project-equivalent test command)
- **build_status** — Pass/fail captured from cargo-operations::check or build-release (or the project-equivalent build command)
- **format_status** — Pass/fail captured from cargo-operations::fmt-check (or the project-equivalent format check)
- **lint_results** — Pass/fail and output captured from cargo-operations::clippy (or the project-equivalent linter)

**Output:**

- **validation_results** — { test_results, build_status, format_status, lint_results, validation_passed } — validation_passed is true iff ALL inputs passed

**Procedure:**

- validation_passed = test_results.passed AND build_status.passed AND format_status.passed AND lint_results.passed. Emit the envelope; do not mutate any input.

## Rules

### no-cargo-here

This skill MUST NOT invoke cargo, describe cargo invocations, or duplicate cargo command-line text. Cargo execution belongs entirely to cargo-operations. validate-build operates on the OUTPUTS of cargo-operations operations.

### no-duplicate-review

Test suite quality was already reviewed in post-impl-review. analyze-failure focuses on root cause of execution failures, not test design.

### do-not-mask-flaky

When analyze-failure classifies a failure as flaky, surface that classification — do not silently retry. The activity loop decides whether to retry or escalate.

## Errors

### persistent_failure

**Cause:** A check fails repeatedly after analyze-failure / apply-fix iterations

**Recovery:** Surface the latest analysis to the user via the activity's checkpoint mechanism

### build_environment

**Cause:** Diagnostics indicate a missing toolchain, dependency, or external service

**Recovery:** Refer the user to the project's setup instructions; do not attempt to install or configure toolchain
