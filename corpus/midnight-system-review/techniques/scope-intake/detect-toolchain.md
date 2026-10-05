---
metadata:
  version: 2.0.0
---

## Capability

The availability of the three optional toolchains (the GitNexus code graph, the cargo build toolchain, and a runnable midnight-node binary), settled as one boolean gate per toolchain.

## Inputs

### repo_name

Name of the indexed graph covering `{target_repo_path}`. Empty when no graph covers the checkout.

### index_stale

Whether the graph named `{repo_name}` is behind the tree it was built from.

### metadata_status

The cargo workspace resolution against `{target_repo_path}`.

### change_surface_inventory

The review's changed-file inventory.

## Outputs

### gitnexus_available

True when `{target_repo_path}` has a fresh GitNexus index.

### cargo_available

True when a working cargo toolchain resolves against `{target_repo_path}`.

### node_binary_available

True when a runnable midnight-node binary is locatable.

## Protocol

### 1. Settle Toolchain Gates

- Emit `{gitnexus_available}` true only where `{repo_name}` is non-empty and `{index_stale}` is false.
- Emit `{cargo_available}` as `{metadata_status}.passed`.
- Locate a midnight-node binary (target build output or an installed release) and confirm it answers a version query; emit `{node_binary_available}` true only on success.
  > A binary that is absent or does not answer leaves `{node_binary_available}` false, and intake continues.

### 2. Record Availability

- Append the Toolchain Availability section of the [change-surface template](../../resources/change-surface.md#template) to `{change_surface_inventory}`: for each of `{gitnexus_available}`, `{cargo_available}` and `{node_binary_available}`, the reading it was settled from and what its false value degrades.
