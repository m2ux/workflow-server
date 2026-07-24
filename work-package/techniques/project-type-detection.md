---
metadata:
  version: 1.0.0
---

## Capability

Auto-detect the project type of the target component from its build manifest, so downstream work can shape comprehension, validation, and review to the technology stack.

## Inputs

### repo_root

Product repo root (monorepo or standalone) holding the component's source tree used for build-manifest inspection.

### component_name

Basename of the component within `{repo_root}`.

## Outputs

### project_type

Detected project type: `rust-substrate` when Substrate dependencies are present, otherwise `other`. Lands in the session bag under this id so downstream activities bind it by name (no further set step required).

Default when detection cannot run: `other`.

## Protocol

1. Inspect the component's source under `{repo_root}/{component_name}`.
2. Check for a `Cargo.toml` with Substrate dependencies (`sp-*`, `frame-*`, `pallet-*`).
3. Set `{project_type}` to `rust-substrate` when those Substrate dependencies are found, otherwise `other`.
