---
metadata:
  version: 1.0.0
---

## Capability

Commit planning artifacts to the parent engineering repo with the activity message pattern, rebasing onto sibling work-package commits to avoid push rejections.

## Inputs

### reference_path

Path to the engineering repo where planning artifacts live

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

- From `reference_path`, stage the artifact files: `git add <files>`.
- Commit with the canonical pattern: `git commit -m "docs(work-package): {activity_name} artifacts for {issue_key}"`. Whether commits are GPG-signed is governed by the user's local git config — do NOT impose `--no-gpg-sign` or `--gpg-sign` overrides.

### 2. Rebase and Push

- BEFORE every push, integrate sibling work-package commits onto the same engineering branch: `git -C {reference_path} pull --rebase origin {branch}`. Without this, two work packages running in parallel on the same monorepo will produce non-fast-forward push rejections and halt mid-flow. The rebase is cheap because each work package writes only to its own planning subfolder, so conflicts are rare.
- Push: `git -C {reference_path} push origin {branch}`.
- If the push is still rejected (race with a sibling that pushed between our rebase and our push), retry the pull --rebase + push cycle once.
