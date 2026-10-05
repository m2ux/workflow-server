---
metadata:
  version: 1.0.0
---

## Capability

Whether cargo resolves a workspace's own manifests, without compiling or fetching: the cheapest proof that a cargo toolchain works against a checkout.

## Inputs

### host_repo_path

Absolute path of the outermost git host for the workspace checkout — the outermost superproject when the component is a submodule, the checkout itself otherwise.

### component_path

Path of the component being worked on, relative to `{host_repo_path}` — `.` for a regular repo. The two together locate the workspace directory holding its top-level `Cargo.toml`.

## Outputs

### metadata_status

`{ check_id: 'metadata', passed: boolean, diagnostics }`. `passed` is true when cargo resolves the workspace, and `diagnostics` is what cargo wrote to stderr.

## Protocol

### 1. Resolve Workspace

- Run `cargo metadata --no-deps --format-version 1 --manifest-path {host_repo_path}/{component_path}/Cargo.toml`, capturing its stderr.
  > `--no-deps` reads the workspace's own manifests and leaves its dependencies unresolved, so the run needs no registry.

### 2. Compose Metadata Status

- Compose `{metadata_status}` = `{ check_id: 'metadata', passed: <exit code 0>, diagnostics: <captured stderr> }`.
  > A path with no manifest exits 101 with `manifest path … does not exist`, and an absent `cargo` binary fails before cargo answers at all. Both read as `passed` false.
