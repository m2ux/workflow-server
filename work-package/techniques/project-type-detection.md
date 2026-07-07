---
metadata:
  version: 1.0.0
---

## Capability

Auto-detect the project type of the target component from its build manifest, so downstream work can shape comprehension, validation, and review to the technology stack.

## Inputs

### reference_path

The reference checkout root holding the component's source. Detection runs here because the worktree does not exist yet — both paths see the same files.

### component_name

Basename of the component within `{reference_path}`.

## Outputs

### project_type

Detected project type: `rust-substrate` when Substrate dependencies are present, otherwise `other`.

## Protocol

1. Inspect the component's source under `{reference_path}`/`{component_name}` (the component as it appears in the reference checkout).
2. Check for a `Cargo.toml` with Substrate dependencies (`sp-*`, `frame-*`, `pallet-*`).
3. Set `project_type` to `rust-substrate` when those Substrate dependencies are found, otherwise `other`.
