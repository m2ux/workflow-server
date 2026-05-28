# identify-path-type

Determine whether a path is a regular directory or a git submodule before committing.

## Inputs

- **path** — Path to inspect

## Output

- **kind** — `submodule` (mode 160000) or `regular` (mode 040000)

## Procedure

1. Run `git ls-tree HEAD {path}` and read the mode prefix.
