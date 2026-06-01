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

1. Always run with `dry_run: true` first; review the change list with the user.
2. Re-run with `dry_run: false` to apply.
