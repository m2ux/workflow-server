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

## Protocol

### 1. Read And Enumerate

- For every file in `{source_files}`, enumerate: (1) pallet hooks (`on_initialize`, `on_finalize`, `on_idle`, `offchain_worker`), (2) `ProvideInherent` methods (`create_inherent`, `check_inherent`, `is_inherent_required`), (3) dispatchable extrinsics (`#[pallet::call]`), (4) public functions and trait implementations, (5) storage declarations (`StorageMap`, `StorageValue`, `StorageDoubleMap`), (6) event types (`Event` enum variants). When `{include_subdirectories}` is set, also descend into submodules (`versions/`, `common/`, `api/`, `internal/`, `impl/`) and enumerate the files found there.

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
