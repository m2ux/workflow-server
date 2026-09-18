---
metadata:
  version: 1.7.1
---

## Capability

The unmet system dependencies a workspace's cargo build would need — `protoc`, openssl headers, `pkg-config` and their like — as a structured environment finding.

## Inputs

### host_repo_path

Absolute path of the outermost git host for the workspace checkout — the outermost superproject when the component is a submodule, the checkout itself otherwise.

### component_path

Path of the component being worked on, relative to `{host_repo_path}` — `.` for a regular repo. The two together locate the component directory.

## Outputs

### missing_prerequisites

Array of `{name, install_hint}` for any unmet prerequisite. Empty array when all prerequisites are present.

## Protocol

### 1. Inspect Build Signals

- Inspect `{host_repo_path}/{component_path}` for build-script signals indicating system-dependency requirements. Common: `protoc` (`libp2p` / `litep2p` crates), `libssl-dev` / openssl headers (`openssl-sys`), `pkg-config`. Walk `Cargo.toml` and any `build.rs` files for these crates.

### 2. Probe Candidates

- For each candidate, probe via `which <name>` and (where applicable) `pkg-config --exists <name>`. Collect any unresolved entries with a one-line `install_hint` (e.g., `apt-get install -y protobuf-compiler` for `protoc`).

### 3. Return Missing Prerequisites

- Return `{missing_prerequisites}`.

## Rules

### probe-reports-only

The finding is this operation's whole product. An `install_hint` names what would resolve a gap; running it is outside this operation.
