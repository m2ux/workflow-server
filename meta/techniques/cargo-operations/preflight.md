---
metadata:
  version: 1.1.0
---

## Capability

Probe required toolchain prerequisites before running any workspace cargo command. Surfaces missing system dependencies (`protoc`, openssl headers, `pkg-config`, ...) as a structured environment finding so validation fails fast rather than mid-workspace-compile.

## Inputs

### host_repo_path

Absolute path of the host repository, as derived by [resolve-host-repo](../version-control/resolve-host-repo.md). `{component_path}` is relative to it.

### component_path

Path of the component whose workspace is inspected, relative to `{host_repo_path}`. The workspace under inspection is `{host_repo_path}/{component_path}`; its `Cargo.toml` and `build.rs` files are walked for build-script signals indicating system-dependency requirements.

## Outputs

### missing_prerequisites

Array of `{name, install_hint}` for any unmet prerequisite. Empty array when all prerequisites are present.

## Protocol

1. Inspect `{host_repo_path}/{component_path}` for build-script signals indicating system-dependency requirements. Common: `protoc` (`libp2p` / `litep2p` crates), `libssl-dev` / openssl headers (`openssl-sys`), `pkg-config`. Walk `Cargo.toml` and any `build.rs` files for these crates.
2. For each candidate, probe via `which <name>` and (where applicable) `pkg-config --exists <name>`. Collect any unresolved entries with a one-line `install_hint` (e.g., `apt-get install -y protobuf-compiler` for `protoc`).
3. Return `missing-prerequisites`. Do NOT attempt installation — environment changes always require user consent. If any required toolchain component is unresolved, surface it to the user as an environment finding rather than auto-installing.
