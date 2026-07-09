---
metadata:
  version: 1.1.0
---

## Capability

Determine whether the working directory is a regular repo or a submodule monorepo, ignoring the `workflows` and `.engineering` infrastructure submodules that every project carries — they are never a target component and must not, on their own, classify a repo as a monorepo.

## Outputs

### is_monorepo

true when `.gitmodules` declares at least one submodule whose path is NOT an infrastructure submodule (`workflows`, `.engineering`); false otherwise.

### target_path

`.` when the repo is regular — set here so no confirmation step is needed. Left for submodule selection to resolve when `is_monorepo` is true.

## Protocol

1. If `.gitmodules` does not exist at the repo root, set `{is_monorepo}` = false and `{target_path}` = `.` — a regular repo. Done.
2. Parse `.gitmodules` and collect the `path` of every `[submodule "..."]` section. Discard any whose path is `workflows` or `.engineering` (the infrastructure submodules present in every project).
3. If one or more submodule paths remain, set `{is_monorepo}` = true and leave `{target_path}` for submodule selection. Otherwise set `{is_monorepo}` = false and `{target_path}` = `.` — the `.gitmodules` file declared only infrastructure submodules, so this is effectively a regular repo.
