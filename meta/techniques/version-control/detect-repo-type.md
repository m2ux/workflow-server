---
metadata:
  version: 1.3.0
---

## Capability

Determine whether the host repository is a regular repo or a submodule monorepo, excluding infrastructure submodules.

## Outputs

### is_monorepo

true when `.gitmodules` declares at least one non-infrastructure submodule; false otherwise.

### component_path

`.` when the repo is regular. Left for submodule selection to resolve when `{is_monorepo}` is true.

## Protocol

1. If `.gitmodules` does not exist at `{host_repo_path}`, set `{is_monorepo}` = false and `{component_path}` = `.` — a regular repo. Done.
2. Parse `{host_repo_path}/.gitmodules` and collect the `path` of every `[submodule "..."]` section. Discard infrastructure submodules, per `version-control.infrastructure-submodule-paths`.
3. If one or more submodule paths remain, set `{is_monorepo}` = true and leave `{component_path}` for submodule selection. Otherwise set `{is_monorepo}` = false and `{component_path}` = `.` — the `.gitmodules` file declared only infrastructure submodules, so this is effectively a regular repo.
