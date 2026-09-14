---
metadata:
  version: 2.0.1
---

## Capability

Owner and repository name for a GitHub REST path, derived from a named working tree's `origin` remote or from the session's repository binding.

## Outputs

### owner

Repository owner login.

### repo

Repository name.

## Protocol

### 1. From Origin Remote

1. When `{repo_path}` is set, read `git -C {repo_path} remote get-url origin` (SSH or HTTPS; strip trailing `.git`), split the resulting `owner/repo` into `{owner}` and `{repo}`; stop. That origin is the repository the named working tree is — the component's own repository when `{repo_path}` is the component tree.

### 2. From Target Repo

1. When `{repo_path}` is unset, split `{target_repo}` on `/` into `{owner}` and `{repo}`. `{target_repo}` is the session's host binding; it names the superproject on a checkout that holds components as submodules.

## Rules

### named-tree-outranks-the-binding

A caller that names `{repo_path}` has said which checkout the call is about, and that checkout's `origin` is the one repository the call can mean. Resolving `{target_repo}` ahead of a named tree sends a component's issues, pull requests and reviews to the host.
