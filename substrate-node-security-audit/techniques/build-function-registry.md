---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 9
  legacy_id: 9
---

## Capability

For a given set of Rust source files, enumerate all functions by type — pallet hooks, inherent provider methods, extrinsics, public functions, trait implementations, storage declarations, and event types — and produce a structured registry table

## Inputs

### source_files

List of `.rs` files to enumerate (a crate, a set of crates, or a full scope)

### include_subdirectories

*(optional)* Whether to traverse into submodules (`versions/`, `common/`, `api/`, `internal/`, `impl/`)

#### default

true

### gitnexus_available

*(optional)* Whether the target is GitNexus-indexed (set at scope-setup). When true, the graph seeds the function enumeration; when false or absent, the full-read enumeration below is used unchanged.

## Protocol

### 1. Read And Enumerate

- For every file in `{source_files}`, enumerate: (1) pallet hooks (`on_initialize`, `on_finalize`, `on_idle`, `offchain_worker`), (2) `ProvideInherent` methods (`create_inherent`, `check_inherent`, `is_inherent_required`), (3) dispatchable extrinsics (`#[pallet::call]`), (4) public functions and trait implementations, (5) storage declarations (`StorageMap`, `StorageValue`, `StorageDoubleMap`), (6) event types (`Event` enum variants). When `{include_subdirectories}` is set, also descend into submodules (`versions/`, `common/`, `api/`, `internal/`, `impl/`) and enumerate the files found there.

> When `{gitnexus_available}`, seed the enumeration from the symbol graph via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../meta/techniques/gitnexus-operations/cypher.md) (query the `Function` nodes for `{source_files}`, by type and visibility) rather than deriving the function set by manual read — the graph is the authoritative, exact registry of what exists. Reading the bodies of priority-1/2 functions for the downstream review is unchanged; this step establishes the complete inventory, not the comprehension.

### 2. Assign Priority

- Classify each function by priority based on reachability: priority-1 (consensus-critical hooks, inherents, block production), priority-2 (service startup, RPC, CLI), priority-3 (off-chain tooling, utilities).

### 3. Produce Registry

- Assemble the `{function_registry}` as a structured table with one row per function. Format: | Function | File:Line | Type (hook/extrinsic/public/storage/event) | Priority |

## Outputs

### function_registry

Structured function registry table.

#### artifact

`r-function-registry.json`

#### registry_table

one row per function with file location, type classification, and priority

#### file_manifest

every file read with line count and read status

## Rules

### largest-files-in-registry

`.rs` files are sorted by line count and the top 10 are included in the registry; the registry covers every priority-1 and priority-2 crate.

### graph-is-exact-count-when-indexed

When `{gitnexus_available}`, the symbol graph supplies the exact function count and inventory per file; a manual `grep 'fn '` count is not needed as a cross-check because the graph is authoritative. When not indexed, the full-read enumeration and its grep cross-check stand.
