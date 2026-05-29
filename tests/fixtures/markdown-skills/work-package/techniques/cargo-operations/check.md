# check

Type-check without producing binaries.

## Inputs

### scope

`'--workspace'` or `'-p <crate>'`

## Output

### check_status

Pass/fail summary

## Procedure

1. `cargo check {scope}`

## Errors

### compile_error

**Cause:** Type-check failed.

**Recovery:** Address the rustc errors and retry.
