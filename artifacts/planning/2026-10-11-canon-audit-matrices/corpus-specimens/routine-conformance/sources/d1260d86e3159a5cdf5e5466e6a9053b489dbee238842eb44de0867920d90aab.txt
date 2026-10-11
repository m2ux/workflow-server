---
metadata:
  version: 1.1.1
---

## Capability

Determine whether a path is a regular directory, a git submodule, or a linked worktree of the parent checkout before committing.

## Inputs

### path

Path to inspect

## Outputs

### kind

`submodule` when the path is mode 160000, `regular` when it is mode 040000, `worktree` when it is a linked worktree of this checkout and absent from its tree. Unset when the path is absent from the tree and is not that worktree.

## Protocol

### 1. Read the Path's Mode

- Run `git ls-tree HEAD {path}` from the parent checkout and read the mode prefix.
  > - When the mode is 160000, `{kind}` is `submodule`.
  > - When the mode is 040000, `{kind}` is `regular`.
  > - When the path is absent from the tree, resolve `git -C {path} rev-parse --git-common-dir` and `git rev-parse --git-common-dir` of the parent to absolute paths. When both name one directory and `git -C {path} rev-parse --show-toplevel` is `{path}`, `{kind}` is `worktree`. When they do not, `{kind}` stays unset.
