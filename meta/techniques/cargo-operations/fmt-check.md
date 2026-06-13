---
metadata:
  version: 1.0.0
---

## Capability

Canonical formatting check; matches CI exactly. Does not compile, so does not need build-jobs caps.

## Inputs

### scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate. `{features}` does not apply — fmt does not compile.

## Outputs

### fmt_status

`{ check_id: 'fmt-check', passed: boolean, diagnostics }` — `passed` is true when no formatting diffs; `diagnostics` is `{fmt_diff_summary}`. This is the shape [run-suite](./run-suite.md) folds into its `validation_results` envelope.

### fmt_diff_summary

Concise summary of files needing formatting (when not passed).

## Protocol

1. `nice -n 19 cargo fmt {scope} -- --check`
2. Compose `{fmt_status}` = `{ check_id: 'fmt-check', passed: <command reported no diffs>, diagnostics: {fmt_diff_summary} }`. When it fails, capture the listed files as `{fmt_diff_summary}`. A failure means source files do not match the rustfmt configuration; to recover, apply [fmt-fix](./fmt-fix.md) to apply formatting, then commit the result.
