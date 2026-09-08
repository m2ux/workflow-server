---
metadata:
  version: 1.5.0
---

## Capability

The unmet system dependencies a workspace's cargo build would need — `protoc`, openssl headers, `pkg-config` and their like — as a structured environment finding.

## Outputs

### missing_prerequisites

Array of `{name, install_hint}` for any unmet prerequisite. Empty array when all prerequisites are present.

## Protocol

1. Inspect `{host_repo_path}/{component_path}` for build-script signals indicating system-dependency requirements. Common: `protoc` (`libp2p` / `litep2p` crates), `libssl-dev` / openssl headers (`openssl-sys`), `pkg-config`. Walk `Cargo.toml` and any `build.rs` files for these crates.
2. For each candidate, probe via `which <name>` and (where applicable) `pkg-config --exists <name>`. Collect any unresolved entries with a one-line `install_hint` (e.g., `apt-get install -y protobuf-compiler` for `protoc`).
3. Return `{missing_prerequisites}`.

## Rules

### probe-reports-only

This operation reports what is absent. An `install_hint` is text on the finding, and the finding is the whole product.
