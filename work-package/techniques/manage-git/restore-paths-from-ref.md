---
metadata:
  version: 1.0.0
---

## Capability

Restore selected worktree paths to match a base git ref (whole file or interactive hunks), then stage the restores.

## Inputs

### target_path

Edit-side checkout the restore runs in (per directory-scope).

### base_ref

Git ref to restore from (default branch name, merge-base SHA, or other commit-ish available in `{target_path}`).

### paths

Array of repository-relative paths to restore from `{base_ref}`.

### interactive

*(optional)* When true, use interactive hunk restore (`checkout -p`) per path. When false or unbound, restore each path whole from `{base_ref}`.

`default: false`

## Outputs

### restored_paths

Paths successfully restored from `{base_ref}` and staged in `{target_path}`. Empty when `{paths}` was empty or every restore was skipped.

## Protocol

### 1. Validate

- From `{target_path}`, confirm `{base_ref}` resolves (`git rev-parse --verify {base_ref}^{commit}`).
- When `{paths}` is empty, set `{restored_paths}` empty and return.

### 2. Restore

- For each path in `{paths}`:
  - When `{interactive}` is true: `git -C {target_path} checkout -p {base_ref} -- {path}` (agent/user selects hunks).
  - Otherwise: `git -C {target_path} checkout {base_ref} -- {path}`.
- Skip paths that do not exist at `{base_ref}` (record and continue); do not invent content.

### 3. Stage

- `git -C {target_path} add -- {restored paths}`.
- Set `{restored_paths}` to the staged set.

## Rules

### edit-side-only

Restores run only inside `{target_path}`. Never restore into `{reference_path}` or the planning folder via this op.
