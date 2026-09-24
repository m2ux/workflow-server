---
metadata:
  version: 1.1.0
---

## Capability

Determine whether a path is a regular directory, a git submodule, or a linked worktree of the parent checkout before committing.

## Inputs

### path

Path to inspect

## Outputs

### kind

`submodule` (mode 160000), `regular` (mode 040000), or `worktree` (a linked worktree of this checkout, absent from its tree).

## Protocol

### 1. Read the Path's Mode

- Run `git ls-tree HEAD {path}` from the parent checkout and read the mode prefix.
  > - When the mode is 160000, `{kind}` is `submodule`.
  > - When the mode is 040000, `{kind}` is `regular`.
  > - When the path is absent from the tree, resolve `git -C {path} rev-parse --git-common-dir` and `git rev-parse --git-common-dir` of the parent to absolute paths. When both name one directory and `git -C {path} rev-parse --show-toplevel` is `{path}`, `{kind}` is `worktree`.
