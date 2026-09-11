---
metadata:
  version: 1.2.0
---

## Capability

Probe the availability of the three optional toolchains — the GitNexus code graph, the cargo build toolchain, and a runnable midnight-node binary — and emit one boolean gate per toolchain so every downstream probe can route to its capability path or its fallback structurally, along with the name of the graph a code-graph probe addresses.

## Outputs

### gitnexus_available

True when `{target_repo_path}` has a fresh GitNexus index; gates code-graph probes, with grep and file reads as the fallback.

### repo_name

Name of the indexed graph covering `{target_repo_path}`, which every code-graph probe addresses. Empty when no graph covers the checkout, which is the same condition as `{gitnexus_available}` being false.

### cargo_available

True when a working cargo toolchain resolves against `{target_repo_path}`; gates build and metadata probes.

### node_binary_available

True when a runnable midnight-node binary is locatable; gates runtime and SCALE-metadata probes.

## Protocol

### 1. Probe Toolchains

- Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[resolve-graph](../../../meta/techniques/gitnexus-operations/resolve-graph.md)(tree_path: `{target_repo_path}`) and take its `{repo_name}` as this workflow's `{repo_name}`. Where the checkout sits inside a larger indexed tree, its `{graph_inventory}` names both graphs and the checkout's own is the one to carry — a containing tree's answers span components outside the review.
- Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../../meta/techniques/gitnexus-operations/verify-index.md) against that `{repo_name}` and read its `{stats}` for the commit the graph was built at; emit `{gitnexus_available}` true only where `{repo_name}` is non-empty and that commit is current for the review surface. A stale index answers in the same shape as a fresh one, per `index-freshness-first`.
- Probe cargo with a cheap metadata invocation against the target workspace; emit `{cargo_available}` true only on success.
- Locate a midnight-node binary (target build output or an installed release) and confirm it answers a version query; emit `{node_binary_available}` true only on success.
- A failed or absent probe emits its gate false — unavailability is data for routing, never an error that stops intake.

### 2. Record Availability

- Append a Toolchain Availability section to the change-surface inventory in `{planning_folder_path}`: per toolchain, the probe performed, the result, and what the false gate will degrade downstream.

### 3. Commit Session Gates

- Land `{gitnexus_available}`, `{repo_name}`, `{cargo_available}`, and `{node_binary_available}` in the session variable bag before scope-intake completes — downstream activities read these gates from session state, not from re-probing.
- Each gate lands under its declared output name; a false gate is valid session data, not an omission.
