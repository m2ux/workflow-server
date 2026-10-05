---
metadata:
  version: 1.0.0
---

## Capability

The workspace's own package graph, resolved without compiling or fetching: the cheapest proof that a cargo toolchain works against a checkout.

## Inputs

### workspace_path

Root directory of the cargo workspace, the directory holding its top-level `Cargo.toml`.

## Outputs

### metadata_status

`{ check_id: 'metadata', passed: boolean, diagnostics }`. `passed` is true when cargo resolves the workspace, and `diagnostics` is the cargo error output, empty when it does.

## Protocol

### 1. Resolve Workspace

- Run `cargo metadata --no-deps --format-version 1 --manifest-path {workspace_path}/Cargo.toml`, capturing its stderr.
  > `--no-deps` reads the workspace's own manifests and leaves its dependencies unresolved, so the run needs no registry.

### 2. Compose Metadata Status

- Compose `{metadata_status}` = `{ check_id: 'metadata', passed: <exit code 0>, diagnostics: <captured stderr> }`.
  > A path with no manifest exits 101 with `manifest path … does not exist`, and an absent `cargo` binary fails before cargo answers at all. Both read as `passed` false.
