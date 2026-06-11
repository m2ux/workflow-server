---
metadata:
  version: 1.0.0
---

## Capability

Run check, clippy, test, and fmt-check concurrently against the same scope and aggregate their statuses into a single validation-results envelope. The canonical entry point for full validation on rust-substrate projects.

## Inputs

### scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate (inherited from the [cargo-operations](./TECHNIQUE.md) group root; declared here as the binding contract).

### features

Optional `--features` flags (empty string when none); inherited from the [cargo-operations](./TECHNIQUE.md) group root.

## Output

### validation_results

The aggregate validation envelope from the four concurrent ops. Each per-check status carries both its verdict and the diagnostics behind it, so a failure can be analyzed directly off the envelope without re-running the op:

#### check_status

status of the [check](./check.md) op: `{ check_id: 'check', passed: boolean, diagnostics }`, where `diagnostics` is the rustc output the op emitted.

#### clippy_status

status of the [clippy](./clippy.md) op: `{ check_id: 'clippy', passed: boolean, diagnostics }`, where `diagnostics` is the op's `lint_diagnostics`.

#### test_status

status of the [test](./test.md) op: `{ check_id: 'test', passed: boolean, diagnostics }`, where `diagnostics` is the op's per-test `failures` detail.

#### fmt_status

status of the [fmt-check](./fmt-check.md) op: `{ check_id: 'fmt-check', passed: boolean, diagnostics }`, where `diagnostics` is the op's `fmt_diff_summary`.

#### failed_checks

Array of the per-check statuses whose `passed` is false, in suite order (`[check_status, clippy_status, ...]` filtered to failures); empty when everything passed. Each entry carries its own `{ check_id, passed, diagnostics }`, so a caller can iterate every failure.

#### first_failure

The first entry of `failed_checks` (suite order: check, then clippy, then test, then fmt-check), or null when nothing failed. Shape: `{ check_id, diagnostics }` — the canonical single failure to analyze, letting a caller bind `check_id` and `diagnostics` for failure analysis without indexing the array.

#### validation_passed

aggregate verdict — true iff all four per-op statuses passed (equivalently, `failed_checks` is empty).

## Protocol

1. Fan out four concurrent shells invoking [check](./check.md), [clippy](./clippy.md), [test](./test.md), and [fmt-check](./fmt-check.md) against the same `{scope}`, passing the same `{features}` flags to each compiling op. Each carries its own resource budget (`nice -n 19` + `CARGO_BUILD_JOBS` cap), so suite peak memory is bounded by the per-op cap, NOT by 4× a single op (fmt-check uses no compile budget at all). If the combined peak of the concurrent cargo invocations still exceeds available RAM despite the per-op budgets, halve `CARGO_BUILD_JOBS` for all (`export CARGO_BUILD_JOBS=2`) and retry; on very tight hosts, fall back to running check/clippy/test sequentially via the per-op operations.
2. Wait for ALL four to finish before composing results. Do NOT short-circuit on the first failure — collect every per-op status and diagnostics so a single pass surfaces every issue rather than forcing serial discovery.
3. Compose each per-check status as `{ check_id, passed, diagnostics }`, folding the op's diagnostic field into `diagnostics`: `{check_status}` from [check](./check.md)'s rustc output, `{clippy_status}.diagnostics` from `{lint_diagnostics}`, `{test_status}.diagnostics` from `{failures}`, `{fmt_status}.diagnostics` from `{fmt_diff_summary}`.
4. Derive `{failed_checks}` = the per-check statuses with `passed == false` in suite order (check, clippy, test, fmt-check); set `{first_failure}` = the first entry of `{failed_checks}` projected to `{ check_id, diagnostics }`, or null when `{failed_checks}` is empty.
5. Compose `{validation_results}` = { `{check_status}`, `{clippy_status}`, `{test_status}`, `{fmt_status}`, `{failed_checks}`, `{first_failure}`, `{validation_passed}`: `{check_status}.passed` AND `{clippy_status}.passed` AND `{test_status}.passed` AND `{fmt_status}.passed` }.

> Follow-up: `check`'s `check_status` currently bundles its diagnostics into a single field rather than emitting a discrete `{ passed }` + diagnostics pair like clippy/test/fmt-check. To make the `diagnostics` projection uniform across all four ops, a later change should have `check.md` surface its rustc output as a discrete diagnostics field (matching `lint_diagnostics`/`failures`/`fmt_diff_summary`). Not editing the per-op signatures here — run-suite folds whatever each op emits into the envelope's per-check `diagnostics`.