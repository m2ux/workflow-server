---
metadata:
  version: 1.1.0
---

## Capability

Fold cargo check, clippy, test, and fmt-check unit outcomes into a single validation-results envelope. The canonical combine for full validation on rust-substrate projects when the binding activity has already gathered the four unit results.

## Inputs

### unit_results

Ordered keyed collection of per-unit cargo outcomes in suite order (check, clippy, test, fmt-check). Each entry carries the unit key and that unit's status payload. The binding activity produces this collection via unit-fan-out over the four cargo ops.

## Outputs

### validation_results

The aggregate validation envelope from the four unit outcomes. Each per-check status carries both its verdict and the diagnostics behind it, so a failure can be analyzed directly off the envelope without re-running the op:

#### check_status

status of the check op: `{ check_id: 'check', passed: boolean, diagnostics }`, where `diagnostics` is the rustc output the op emitted.

#### clippy_status

status of the clippy op: `{ check_id: 'clippy', passed: boolean, diagnostics }`, where `diagnostics` is the op's `lint_diagnostics`.

#### test_status

status of the test op: `{ check_id: 'test', passed: boolean, diagnostics }`, where `diagnostics` is the op's per-test `failures` detail.

#### fmt_status

status of the fmt-check op: `{ check_id: 'fmt-check', passed: boolean, diagnostics }`, where `diagnostics` is the op's `fmt_diff_summary`.

#### failed_checks

Array of the per-check statuses whose `passed` is false, in suite order (`[check_status, clippy_status, ...]` filtered to failures); empty when everything passed. Each entry carries its own `{ check_id, passed, diagnostics }`, so a caller can iterate every failure.

#### first_failure

The first entry of `failed_checks` (suite order: check, then clippy, then test, then fmt-check), or null when nothing failed. Shape: `{ check_id, diagnostics }` — the canonical single failure to analyze, letting a caller bind `check_id` and `diagnostics` for failure analysis without indexing the array.

#### validation_passed

aggregate verdict — true iff all four per-op statuses passed (equivalently, `failed_checks` is empty).

## Protocol

1. Project each entry of `{unit_results}` into a per-check status `{ check_id, passed, diagnostics }`, folding the unit's diagnostic field into `diagnostics`: `{check_status}` from check's rustc output, `{clippy_status}.diagnostics` from `{lint_diagnostics}`, `{test_status}.diagnostics` from `{failures}`, `{fmt_status}.diagnostics` from `{fmt_diff_summary}`.
2. Derive `{$failed_checks}` = the per-check statuses with `passed == false` in suite order (check, clippy, test, fmt-check); set `{$first_failure}` = the first entry of `{$failed_checks}` projected to `{ check_id, diagnostics }`, or null when `{$failed_checks}` is empty.
3. Compose `{validation_results}` = { `{check_status}`, `{clippy_status}`, `{test_status}`, `{fmt_status}`, `failed_checks`: `{$failed_checks}`, `first_failure`: `{$first_failure}`, `validation_passed`: `{check_status}.passed` AND `{clippy_status}.passed` AND `{test_status}.passed` AND `{fmt_status}.passed` }. Downstream reads reach the fields by path into the envelope (`validation_results.validation_passed`), so no field is also emitted as a separate output.

> Follow-up: `check`'s `check_status` currently bundles its diagnostics into a single field rather than emitting a discrete `{ passed }` + diagnostics pair like clippy/test/fmt-check. To make the `diagnostics` projection uniform across all four ops, a later change should have `check.md` surface its rustc output as a discrete diagnostics field (matching `lint_diagnostics`/`failures`/`fmt_diff_summary`). Not editing the per-op signatures here — this combine folds whatever each op emits into the envelope's per-check `diagnostics`.

## Rules

### activity-owns-fan-out

The binding activity owns process-unit scatter: it binds unit-fan-out with the cargo unit roster (check, clippy, test, fmt-check), `{build_scope}` / `{features}`, resource budgets, RAM backoff, and `{dispatch_concurrency}` (including `1` for sequential). This technique only folds gathered `{unit_results}` into `{validation_results}`.
