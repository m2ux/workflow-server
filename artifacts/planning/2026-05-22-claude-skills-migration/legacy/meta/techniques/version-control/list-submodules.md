# list-submodules

Read and parse `.gitmodules` to enumerate submodule paths.

## Output

- **submodules** — Array of `{ path, name, url }` entries

## Procedure

1. Read `.gitmodules`; parse each `[submodule "name"]` section to extract `path` and `url`.
