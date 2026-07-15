---
metadata:
  version: 1.1.0
---

## Capability

Probe the availability of the three optional toolchains — the GitNexus code graph, the cargo build toolchain, and a runnable midnight-node binary — and emit one boolean gate per toolchain so every downstream probe can route to its capability path or its fallback structurally.

## Outputs

### gitnexus_available

True when `{target_repo_path}` has a fresh GitNexus index; gates code-graph probes, with grep and file reads as the fallback.

### cargo_available

True when a working cargo toolchain resolves against `{target_repo_path}`; gates build and metadata probes.

### node_binary_available

True when a runnable midnight-node binary is locatable; gates runtime and SCALE-metadata probes.

## Protocol

### 1. Probe Toolchains

- Probe the GitNexus index for `{target_repo_path}` (index presence and freshness); emit `{gitnexus_available}` true only on a fresh, queryable index.
- Probe cargo with a cheap metadata invocation against the target workspace; emit `{cargo_available}` true only on success.
- Locate a midnight-node binary (target build output or an installed release) and confirm it answers a version query; emit `{node_binary_available}` true only on success.
- A failed or absent probe emits its gate false — unavailability is data for routing, never an error that stops intake.

### 2. Record Availability

- Append a Toolchain Availability section to the change-surface inventory in `{planning_folder_path}`: per toolchain, the probe performed, the result, and what the false gate will degrade downstream.

### 3. Commit Session Gates

- Land `{gitnexus_available}`, `{cargo_available}`, and `{node_binary_available}` in the session variable bag before scope-intake completes — downstream activities read these gates from session state, not from re-probing.
- Each gate lands under its declared output name; a false gate is valid session data, not an omission.
