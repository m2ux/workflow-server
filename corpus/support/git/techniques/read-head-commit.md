---
metadata:
  version: 1.0.0
---

## Capability

The commit a checkout's `HEAD` stands at, read without writing anything.

## Inputs

### repo_path

Working tree to read.

## Outputs

### head_sha

Full SHA of the commit `HEAD` stands at. Null where `HEAD` names no commit.

## Protocol

### 1. Read the Head

- `git -C {repo_path} rev-parse --verify --quiet HEAD`, and record the commit it prints as `{head_sha}`.
  > A repository with no commits yet prints nothing and exits 1, so `{head_sha}` is null. The form without `--verify` prints the word `HEAD` on that failure, which reads as a revision name.
