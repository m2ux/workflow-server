---
metadata:
  version: 1.1.2
---

## Capability

Determine whether the working directory is a regular repo or a submodule monorepo, excluding infrastructure submodules per [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths.

## Outputs

### is_monorepo

true when `.gitmodules` declares at least one non-infrastructure submodule (per [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths); false otherwise.

### target_path

`.` when the repo is regular — set here so no confirmation step is needed. Left for submodule selection to resolve when `is_monorepo` is true.

## Protocol

1. If `.gitmodules` does not exist at the repo root, set `{is_monorepo}` = false and `{target_path}` = `.` — a regular repo. Done.
2. Parse `.gitmodules` and collect the `path` of every `[submodule "..."]` section. Discard infrastructure submodules — apply [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths.
3. If one or more submodule paths remain, set `{is_monorepo}` = true and leave `{target_path}` for submodule selection. Otherwise set `{is_monorepo}` = false and `{target_path}` = `.` — the `.gitmodules` file declared only infrastructure submodules, so this is effectively a regular repo.
