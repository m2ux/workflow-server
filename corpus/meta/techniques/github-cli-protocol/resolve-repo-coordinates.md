---
metadata:
  version: 2.0.0
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

1. When `{repo_path}` is set, read `git -C {repo_path} remote get-url origin` (SSH or HTTPS; strip trailing `.git`), split the resulting `owner/repo` into `{owner}` and `{repo}`; stop.

### 2. From Target Repo

1. When `{repo_path}` is unset, split `{target_repo}` on `/` into `{owner}` and `{repo}`.

## Rules

### named-tree-outranks-the-binding

A caller that names `{repo_path}` has said which checkout the call is about, and that checkout's `origin` is the one repository the call can mean. `{target_repo}` is the session's repository binding: on a superproject holding components as submodules it names the superproject, so resolving it ahead of a named tree sends a component's issues, pull requests and reviews to the host — version-control.host-is-derived-component-is-named.
