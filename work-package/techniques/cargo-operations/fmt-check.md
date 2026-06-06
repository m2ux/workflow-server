---
metadata:
  version: 1.0.0
---

## Capability

Canonical formatting check; matches CI exactly. Does not compile, so does not need build-jobs caps.

## Output

### fmt_status

{ passed: boolean } — true when no formatting diffs

### fmt_diff_summary

Concise summary of files needing formatting (when not passed)

## Protocol

1. `nice -n 19 cargo fmt {scope} -- --check`
2. Report `fmt-status` from the exit code — passed when the command reports no diffs; when it fails, capture the listed files as `fmt-diff-summary`. A failure means source files do not match the rustfmt configuration; to recover, apply [fmt-fix](./fmt-fix.md) to apply formatting, then commit the result.
