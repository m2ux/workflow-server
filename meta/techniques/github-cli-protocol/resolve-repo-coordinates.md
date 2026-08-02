---
metadata:
  version: 1.0.0
---

## Capability

Owner and repository name for a GitHub REST path, derived from bag `{target_repo}` or from a working tree's `origin` remote.

## Inputs

### target_repo

*(optional when `{repo_path}` is set)* GitHub repository as `owner/repo`.

### repo_path

*(optional when `{target_repo}` is set)* Working tree whose `origin` remote supplies `owner/repo` when `{target_repo}` is unset.

## Outputs

### owner

Repository owner login.

### repo

Repository name.

## Protocol

### 1. From Target Repo

1. When `{target_repo}` is set, split it on `/` into `{owner}` and `{repo}`; stop.

### 2. From Origin Remote

1. When `{target_repo}` is unset, read `git -C {repo_path} remote get-url origin` (SSH or HTTPS; strip trailing `.git`), split the resulting `owner/repo` into `{owner}` and `{repo}`.
