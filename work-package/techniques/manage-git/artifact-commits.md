---
metadata:
  version: 1.0.0
---

## Capability

Commit planning artifacts in the engineering checkout with the canonical message pattern, rebasing onto sibling work-package commits to avoid push rejections.

## Inputs

### activity_name

Name of the activity that produced the artifacts (e.g., `wp-plan`, `implement`)

### issue_key

Issue identifier (e.g., `WORKFLOW-123` or `#42`)

### files

List of files to stage and commit

### branch

Engineering branch to push to

## Protocol

### 1. Commit Artifacts

- Resolve `{$eng_git_dir}`: `{host_repo_path}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{host_repo_path}`.
- Stage the artifact files: `git -C {eng_git_dir} add {files}`.
- Commit with the canonical pattern: `git commit -m "docs(work-package): {activity_name} artifacts for {issue_key}"`. Whether commits are GPG-signed is governed by the user's local git config — do NOT impose `--no-gpg-sign` or `--gpg-sign` overrides.

### 2. Rebase and Push

- BEFORE every push, integrate sibling work-package commits onto the same engineering branch: `git -C {eng_git_dir} pull --rebase origin {branch}`. Without this, two work packages running in parallel will produce non-fast-forward push rejections and halt mid-flow. The rebase is cheap because each work package writes only to its own planning subfolder, so conflicts are rare.
- Push: `git -C {eng_git_dir} push origin {branch}`.
- If the push is still rejected (race with a sibling that pushed between our rebase and our push), retry the `pull --rebase` + `push` cycle once.
