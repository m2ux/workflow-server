---
metadata:
  version: 1.0.0
---

## Capability

Determine whether a path is a regular directory or a git submodule before committing.

## Inputs

### path

Path to inspect

## Output

### kind

`submodule` (mode 160000) or `regular` (mode 040000)

## Protocol

1. Run `git ls-tree HEAD {path}` and read the mode prefix, returning {kind} as `submodule` when the mode is 160000 or `regular` when it is 040000.
