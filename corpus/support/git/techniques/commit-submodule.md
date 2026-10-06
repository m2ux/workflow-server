---
metadata:
  version: 1.4.0
---

## Capability

Commit and push inside a submodule and sync the parent's submodule pointer. A clean submodule working tree ends the technique at the status read.

## Inputs

### submodule_path

Path of the submodule from the repo root (e.g., `workflows`, `.engineering/workflows`)

### activity_id

The activity whose source changes this commit records.

### workflow_id

The workflow the activity belongs to.

## Outputs

### paths

Tracked paths `git status --porcelain` names in the submodule. Empty when the working tree is clean, and the later phases do not run.

## Protocol

### 1. Read the Tree

- `git -C {submodule_path} status --porcelain` is `{paths}`. When it prints nothing, `{paths}` is empty and the later phases do not run.

### 2. Honour the Trailer Policy

- Read `{submodule_path}/AGENTS.md` when it is present. `{$submodule_message}` is `<type>({workflow_id}): {activity_id} source changes`, and `<type>` is the Conventional Commits type the activity fits: feat for implement, fix for post-impl-review fixes, refactor for cleanup. When the file forbids Co-Authored-By, LLM attribution, or similar trailers, those trailers are not in `{submodule_message}`.

### 3. Stage Submodule Paths

- `git -C {submodule_path} add {paths}`.

### 4. Commit the Submodule

- `git -C {submodule_path} commit --no-gpg-sign -m '{submodule_message}'`.

### 5. Read the Submodule Branch

- `git -C {submodule_path} branch --show-current` is `{$submodule_branch}`.

### 6. Push the Submodule

- `git -C {submodule_path} push origin {submodule_branch}`, on the host shell per `git.host-shell-for-remote-git`. This push completes before the parent commit. Skipped, the parent points at a submodule commit the remote does not hold.

### 7. Read the Parent

- `git -C {submodule_path} rev-parse --show-superproject-working-tree` is `{$parent_path}`.

### 8. Stage the Pointer

- `git -C {parent_path} add {submodule_path}`.

### 9. Commit the Pointer

- `git -C {parent_path} commit --no-gpg-sign -m 'chore: update {submodule_path} submodule'`. Skipped, the parent still points at the old submodule commit.

### 10. Read the Parent Branch

- `git -C {parent_path} branch --show-current` is `{$parent_branch}`.

### 11. Push the Parent

- `git -C {parent_path} push origin {parent_branch}`, on the host shell per `git.host-shell-for-remote-git`.
