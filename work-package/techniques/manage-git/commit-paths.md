---
metadata:
  version: 1.0.0
---

## Capability

Stage and commit selected paths on the edit-side feature branch (code commits, not planning-folder artifact commits).

## Inputs

### target_path

Edit-side checkout the commit runs in (per directory-scope).

### branch_name

Feature branch the commit lands on.

### paths

Array of repository-relative paths (or git pathspecs) to stage and commit.

### commit_message

Commit subject (and optional body). Conventional Commits preferred for source changes.

## Outputs

### commit_sha

SHA of the new commit on `{branch_name}`, or empty when there was nothing to commit (clean index for `{paths}`).

## Protocol

### 1. Branch guard

- From `{target_path}`, confirm the current branch is `{branch_name}` (`git branch --show-current`). On mismatch, STOP and surface the branch-state — do not commit on the wrong branch.

### 2. Stage

- `git -C {target_path} add -- {paths}`.
- When the staged diff for those paths is empty, set `{commit_sha}` empty and return (no empty commit).

### 3. Commit

- Commit with `{commit_message}`, honouring [code-commit-coauthor-trailer](./TECHNIQUE.md#code-commit-coauthor-trailer). Whether commits are GPG-signed follows the user's local git config — do not impose `--no-gpg-sign` / `--gpg-sign` overrides here.
- Capture `{commit_sha}` (`git rev-parse HEAD`).

## Rules

### not-artifact-commits

Planning-folder / engineering-repo artifact commits use [artifact-commits](./artifact-commits.md). This op is for edit-side (`{target_path}`) source and in-repo fragments only.

### no-push

This op does not push. Callers that need a remote update Apply [push-commits](./push-commits.md) separately.
