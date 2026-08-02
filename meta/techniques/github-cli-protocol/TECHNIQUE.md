---
metadata:
  version: 3.4.1
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

### github-access-only-here

Outside this technique group, GitHub access is an Apply of a leaf op. Domain techniques do not embed `gh api` recipes or split `{target_repo}` into owner/repo.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.
