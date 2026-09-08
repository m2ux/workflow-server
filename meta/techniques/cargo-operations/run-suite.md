---
metadata:
  version: 1.4.0
---

## Capability

One validation verdict for a rust-substrate project — compilation, lints, tests and formatting — with each check's diagnostics carried beside its status. The entry point for full validation.

## Outputs

### validation_results

The aggregate validation envelope. It carries the four per-check statuses — `check_status`, `clippy_status`, `test_status`, `fmt_status`, each in the shape its own contract declares — and adds three fields of its own:

#### failed_checks

The per-check statuses whose `passed` is false, in suite order — check, clippy, test, fmt-check. Empty when every check passed.

#### first_failure

The first entry of `failed_checks` projected to `{ check_id, diagnostics }`, or null when `failed_checks` is empty.

#### validation_passed

Aggregate verdict: true exactly when `failed_checks` is empty.

## Protocol

1. Start four concurrent shell invocations of [check](./check.md), [clippy](./clippy.md), [test](./test.md), and [fmt-check](./fmt-check.md) against the same `{build_scope}`, passing the same `{features}` flags to each compiling op. Each op carries its own budget, so the suite's peak is bounded by the per-op cap rather than by four of them, and fmt-check compiles nothing at all.
   > - When the combined peak still exceeds available RAM, halve the job cap for all (`export CARGO_BUILD_JOBS=2`) and retry.
   > - Below the host floor [resource-budget](./TECHNIQUE.md#resource-budget) names, run check, clippy and test one after another through the per-op operations.
2. Wait for all four to finish before composing results, collecting every per-op status and its diagnostics.
3. Take each per-check status as its operation publishes it, each carrying that operation's diagnostics: `{check_status}` with `{check_diagnostics}`, `{clippy_status}` with `{lint_diagnostics}`, `{test_status}` with `{failures}`, `{fmt_status}` with `{fmt_diff_summary}`.
4. Derive `{$failed_checks}` = those statuses with `passed == false` in suite order (check, clippy, test, fmt-check); set `{$first_failure}` = the first entry of `{$failed_checks}` projected to `{ check_id, diagnostics }`, or null when `{$failed_checks}` is empty.
5. Compose `{validation_results}` = { `{check_status}`, `{clippy_status}`, `{test_status}`, `{fmt_status}`, `failed_checks`: `{$failed_checks}`, `first_failure`: `{$first_failure}`, `validation_passed`: `{$failed_checks}` is empty }.

## Rules

### every-check-reports

The suite's verdict covers all four checks on every run. A first failure does not end the run, because a caller acting on one failure at a time discovers the rest one run at a time.