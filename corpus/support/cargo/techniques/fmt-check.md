---
metadata:
  version: 1.2.0
---

## Capability

Canonical formatting verdict for the sources in scope, matching what CI enforces.

## Outputs

### fmt_status

`{ check_id: 'fmt-check', passed: boolean, diagnostics }` — `passed` is true when no formatting diffs; `diagnostics` is `{fmt_diff_summary}`.

### fmt_diff_summary

Concise summary of files needing formatting (when not passed).

## Protocol

### 1. Check Formatting

- Take `{$fmt_scope}` as `{build_scope}`, with `--workspace` written as `--all`.
  > `cargo fmt` names the whole workspace `--all` and refuses `--workspace`; `-p <crate>` passes through unchanged.
- `nice -n 19 cargo fmt {fmt_scope} -- --check`

### 2. Compose Format Status

- Compose `{fmt_status}` = `{ check_id: 'fmt-check', passed: <command reported no diffs>, diagnostics: {fmt_diff_summary} }`.
  > When `passed` is false, the listed files do not match the rustfmt configuration. Capture them as `{fmt_diff_summary}`, apply [fmt-fix](./fmt-fix.md), then commit the result.