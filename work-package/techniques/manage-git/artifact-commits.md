---
metadata:
  version: 1.0.0
---

## Capability

Commit planning artifacts in the engineering checkout (under `{repo_root}/.engineering` when that path is a git checkout, otherwise `{repo_root}`) with the canonical message pattern, rebasing onto sibling work-package commits to avoid push rejections.

## Inputs

### activity_name

Name of the activity that produced the artifacts (e.g., `wp-plan`, `implement`)

### issue_key

Issue identifier (e.g., `WORKFLOW-123` or `#42`)

### files

List of files to stage and commit

### branch

Engineering branch to push to

### repo_root

Path to the product repo root. Staging/commit/push run in `{repo_root}/.engineering` when that directory is a git checkout (install layout submodule); otherwise in `{repo_root}`.

## Outputs

### artifact_commit

The artifact commit pushed to `{branch}` on `origin` in `{eng_git_dir}`, carrying the canonical `docs(work-package): {activity_name} artifacts for {issue_key}` message and rebased onto sibling work-package commits. A side-effect op; the pushed commit is its product.

## Protocol

### 1. Commit Artifacts

- Resolve `{$eng_git_dir}`: `{repo_root}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{repo_root}`.
- Stage the artifact files: `git -C {eng_git_dir} add {files}`.
- Commit with the canonical pattern: `git commit -m "docs(work-package): {activity_name} artifacts for {issue_key}"`. Whether commits are GPG-signed is governed by the user's local git config — do NOT impose `--no-gpg-sign` or `--gpg-sign` overrides.

### 2. Rebase and Push

- BEFORE every push, integrate sibling work-package commits onto the same engineering branch: `git -C {eng_git_dir} pull --rebase origin {branch}`. Without this, two work packages running in parallel will produce non-fast-forward push rejections and halt mid-flow. The rebase is cheap because each work package writes only to its own planning subfolder, so conflicts are rare.
- Push: `git -C {eng_git_dir} push origin {branch}`.
- If the push is still rejected (race with a sibling that pushed between our rebase and our push), retry the `pull --rebase` + `push` cycle once.
