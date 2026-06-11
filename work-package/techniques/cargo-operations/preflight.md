---
metadata:
  version: 1.0.0
---

## Capability

Probe required toolchain prerequisites before running any workspace cargo command. Surfaces missing system dependencies (`protoc`, openssl headers, `pkg-config`, ...) as a structured environment finding so the validate activity fails fast rather than mid-workspace-compile.

## Inputs

### target_path

Path to the workspace under inspection; its `Cargo.toml` and `build.rs` files are walked for build-script signals indicating system-dependency requirements.

## Output

### missing_prerequisites

Array of `{name, install_hint}` for any unmet prerequisite. Empty array when all prerequisites are present.

## Protocol

1. Inspect `target_path` for build-script signals indicating system-dependency requirements. Common: `protoc` (`libp2p` / `litep2p` crates), `libssl-dev` / openssl headers (`openssl-sys`), `pkg-config`. Walk `Cargo.toml` and any `build.rs` files for these crates.
2. For each candidate, probe via `which <name>` and (where applicable) `pkg-config --exists <name>`. Collect any unresolved entries with a one-line `install_hint` (e.g., `apt-get install -y protobuf-compiler` for `protoc`).
3. Return `missing-prerequisites`. Do NOT attempt installation — environment changes always require user consent. If any required toolchain component is unresolved, surface it to the user as an environment finding via the activity's validate action rather than auto-installing.
