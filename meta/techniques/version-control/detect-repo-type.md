# detect-repo-type

Determine whether the working directory is a regular repo or a submodule monorepo.

## Output

### is_monorepo

true when `.gitmodules` exists at the repo root

## Procedure

1. Run `test -f .gitmodules`; `is_monorepo` is true when the file exists, false otherwise.
