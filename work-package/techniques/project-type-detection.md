---
metadata:
  version: 1.0.0
---

## Capability

Auto-detect the project type of the target component from its build manifest, so downstream work can shape comprehension, validation, and review to the technology stack.

## Inputs

### host_repo_path

Product repo root (monorepo or standalone) holding the component's source tree used for build-manifest inspection.

### component_name

Basename of the component within `{host_repo_path}`.

## Outputs

### project_type

Detected project type: `rust-substrate` when Substrate dependencies are present, otherwise `other`.

Default when detection cannot run: `other`.

## Protocol

1. Inspect the component's source under `{host_repo_path}/{component_name}`.
2. Check for a `Cargo.toml` with Substrate dependencies (`sp-*`, `frame-*`, `pallet-*`).
3. Set `{project_type}` to `rust-substrate` when those Substrate dependencies are found, otherwise `other`.
