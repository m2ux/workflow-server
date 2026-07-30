---
metadata:
  version: 1.0.0
---

## Capability

Resolve the engineering checkout's publish branch and the planning-folder files that ride on it, for artifact hyperlink construction.

## Inputs

### planning_folder_path

Path to the planning folder whose artifacts the consolidated review links (`README.md`, report artifacts, `review-summary.md`).

### host_repo_path

Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it.

## Outputs

### artifact_publish_ref

The engineering checkout's branch name — the ref engineering-artifact hyperlinks resolve against.

### publishable_files

Every changed file under `{planning_folder_path}`, including `README.md`, the linked report artifacts, `review-summary.md`, `session.json` and `.session-token`.

## Protocol

1. Resolve `{$eng_git_dir}`: `{host_repo_path}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{host_repo_path}`. Resolve `{$eng_branch}`: `git -C {eng_git_dir} branch --show-current` — never hardcode `main`.
2. Collect every changed path under `{planning_folder_path}` as `{publishable_files}` (`git -C {eng_git_dir} status --porcelain` restricted to that folder), and emit `{eng_branch}` as `{artifact_publish_ref}`.

## Rules

### publish-ref-is-a-branch

The emitted ref is the branch, never a commit SHA. The planning folder keeps growing after a review is posted — close-out, retrospective, session trace and follow-ups all arrive later — so a reader following a branch link sees the current tree while a reader following a sha link sees the tree as it stood before those files existed. Re-resolving on a later activity refreshes the branch tip without changing any link already posted.

### resolve-before-linking

The file set and the ref are resolved together, in that order, before any hyperlink carrying the ref is rendered. The commit that puts those files on that branch is a separate activity step — [manage-git](./manage-git/TECHNIQUE.md)::[artifact-commits](./manage-git/artifact-commits.md) — so a link is written only after the step that pushed its target has run ([push-before-linking](./manage-artifacts/TECHNIQUE.md#push-before-linking)).
