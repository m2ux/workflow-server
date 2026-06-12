---
metadata:
  version: 1.0.0
---

## Capability

Type-check without producing binaries.

## Inputs

### scope

`'--workspace'` or `'-p <crate>'`

## Outputs

### check_status

Pass/fail summary

## Protocol

1. `cargo check {scope}`

## Errors

### compile_error

**Cause:** Type-check failed.

**Recovery:** Address the rustc errors and retry.
