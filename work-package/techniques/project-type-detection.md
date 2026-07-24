---
metadata:
  version: 1.0.0
---

## Capability

Auto-detect the project type of the target component from its build manifest, so downstream work can shape comprehension, validation, and review to the technology stack.

## Inputs

### repo_root

The repo root holding the component's source. Detection runs here because the worktree does not exist yet — both paths see the same files.

### component_name

Basename of the component within `{repo_root}`.

## Outputs

### project_type

Detected project type: `rust-substrate` when Substrate dependencies are present, otherwise `other`. Lands in the session bag under this id so downstream activities bind it by name (no further set step required).

Default when detection cannot run: `other`.

## Protocol

1. Inspect the component's source under `{repo_root}`/`{component_name}` (the component as it appears under the repo root).
2. Check for a `Cargo.toml` with Substrate dependencies (`sp-*`, `frame-*`, `pallet-*`).
3. Set `project_type` to `rust-substrate` when those Substrate dependencies are found, otherwise `other`.
