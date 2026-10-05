---
metadata:
  version: 2.0.0
---

## Capability

Settle the availability of the three optional toolchains (the GitNexus code graph, the cargo build toolchain, and a runnable midnight-node binary) as one boolean gate per toolchain, so every downstream probe can route to its capability path or its fallback structurally.

## Inputs

### repo_name

Name of the indexed graph covering `{target_repo_path}`. Empty when no graph covers the checkout.

### index_stale

Whether the graph named `{repo_name}` is behind the tree it was built from.

### metadata_status

The cargo workspace resolution against `{target_repo_path}`.

## Outputs

### gitnexus_available

True when `{target_repo_path}` has a fresh GitNexus index; gates code-graph probes, with grep and file reads as the fallback.

### cargo_available

True when a working cargo toolchain resolves against `{target_repo_path}`; gates build and metadata probes.

### node_binary_available

True when a runnable midnight-node binary is locatable; gates runtime and SCALE-metadata probes.

## Protocol

### 1. Settle Toolchain Gates

- Emit `{gitnexus_available}` true only where `{repo_name}` is non-empty and `{index_stale}` is false. A stale index answers in the same shape as a fresh one, per `gitnexus.index-freshness-first`.
- Emit `{cargo_available}` as `{metadata_status}.passed`.
- Locate a midnight-node binary (target build output or an installed release) and confirm it answers a version query; emit `{node_binary_available}` true only on success.
- A failed or absent probe emits its gate false: unavailability is data for routing, never an error.

### 2. Record Availability

- Append a Toolchain Availability section to the change-surface inventory in `{planning_folder_path}`: per toolchain, the probe performed, the result, and what the false gate will degrade downstream.
