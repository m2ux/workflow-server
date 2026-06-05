---
metadata:
  version: 1.0.0
---

## Capability

Multi-file rename driven by the call graph (preview or apply).

## Inputs

### repo_name

Repository name

### old_name

Current symbol name

### new_name

Target symbol name

### dry_run

true to preview edits without applying

## Output

### changes

Per-file edit list (when `dry_run`) or applied summary

## Protocol

1. Rename `old_name` to `new_name` in `repo_name`, always running with `dry_run: true` first; review the returned `changes` list with the user.
2. Re-run with `dry_run: false` to apply.
