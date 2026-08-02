---
metadata:
  version: 1.0.0
---

## Capability

Three-dot merge-base change surface for a working tree: name-status and per-file line counts against a base ref.

## Inputs

### repo_path

Working tree to diff.

### base_ref

Base ref for the three-dot range (`{base_ref}...HEAD`).

## Outputs

### changed_files

Ordered list of changed paths in the three-dot range.

### changed_file_entries

Ordered list of changed-file records: `path`, `status` (git name-status letter or rename form), `additions`, `deletions`.

### head_sha

Full SHA of `HEAD` in `{repo_path}`.

### base_sha

Full SHA of the merge-base of `{base_ref}` and `HEAD`.

## Protocol

### 1. Resolve Tips

1. `git -C {repo_path} rev-parse HEAD` → `{head_sha}`.
2. `git -C {repo_path} merge-base {base_ref} HEAD` → `{base_sha}`.

### 2. Name Status And Stats

1. `git -C {repo_path} diff --name-status {base_ref}...HEAD` paired with `git -C {repo_path} diff --numstat {base_ref}...HEAD`.
2. Build `{changed_file_entries}` (one row per path; renames keep git's rename status form) and set `{changed_files}` to the path column in the same order.
