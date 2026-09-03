---
metadata:
  version: 1.0.0
---

## Capability

Canonical formatting check; matches CI exactly. Does not compile, so does not need build-jobs caps.

## Outputs

### fmt_status

`{ check_id: 'fmt-check', passed: boolean, diagnostics }` — `passed` is true when no formatting diffs; `diagnostics` is `{fmt_diff_summary}`.

### fmt_diff_summary

Concise summary of files needing formatting (when not passed).

## Protocol

1. `nice -n 19 cargo fmt {build_scope} -- --check`
2. Compose `{fmt_status}` = `{ check_id: 'fmt-check', passed: <command reported no diffs>, diagnostics: {fmt_diff_summary} }`.
   > When `passed` is false, the listed files do not match the rustfmt configuration. Capture them as `{fmt_diff_summary}`, apply [fmt-fix](./fmt-fix.md), then commit the result.
