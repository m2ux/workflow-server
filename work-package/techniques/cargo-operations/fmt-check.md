Canonical formatting check; matches CI exactly. Does not compile, so does not need build-jobs caps.

## Inputs

### scope

`'--all'` for the full workspace (default and CI parity), or omit for the local crate

## Output

### fmt_status

{ passed: boolean } — true when no formatting diffs

### fmt_diff_summary

Concise summary of files needing formatting (when not passed)

## Protocol

1. `nice -n 19 cargo fmt {scope} -- --check`

## Errors

### formatting_diffs

**Cause:** Source files do not match rustfmt configuration

**Recovery:** Apply [fmt-fix](./fmt-fix.md) to apply formatting, then commit the result
