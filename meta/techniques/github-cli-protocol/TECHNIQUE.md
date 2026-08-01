---
metadata:
  version: 3.4.0
---

## Capability

GitHub PR and issue tasks. Callers Apply leaf ops; REST paths, `gh api` recipes, and owner/repo resolution live only in this group.

## Inputs

### target_repo

*(optional when `{repo_path}` is set on the leaf)* GitHub repository as `owner/repo`.

### repo_path

*(optional when `{target_repo}` is set)* Working tree whose `origin` remote supplies `owner/repo` when `{target_repo}` is unset.

## Rules

### rest-only

Every GitHub read and write in this technique is a `gh api` call against a REST path. High-level `gh pr` and `gh issue` subcommands are outside this technique.

### resolve-repo-coordinates

Before any REST path that needs owner and repo, set `{$owner}` and `{$repo}` from `{target_repo}` when it is set (split on `/`). When `{target_repo}` is unset, derive `owner/repo` from `git -C {repo_path} remote get-url origin` (SSH or HTTPS; strip trailing `.git`), then split into `{$owner}` and `{$repo}`.

### github-access-only-here

Outside this technique group, GitHub access is an Apply of a leaf op. Domain techniques do not embed `gh api` recipes or split `{target_repo}` into owner/repo.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.
