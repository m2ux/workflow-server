---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 13
  legacy_id: 13
---

## Capability

Enumerate, classify, and trace components of a codebase to build a structured architectural map for downstream analysis

## Inputs

### workspace_root

Path to the workspace `Cargo.toml` or equivalent project manifest

### in_scope

Paths to include in the analysis

### out_of_scope

*(optional)* Paths to exclude

## Protocol

### 1. Enumerate Components

- Read the project manifest at `{workspace_root}` and enumerate every crate, module, or package under the `{in_scope}` paths, skipping anything listed in `{out_of_scope}`. List each component explicitly by name — do not summarize or group.

### 2. Classify Components

- Assign each component to an architectural category. Standard categories for Substrate codebases: runtime (on-chain/Wasm), native (node binary), shared primitives, off-chain tooling. Assign priority: 1 (consensus-critical), 2 (important), 3 (lower risk), 4 (utility/docs).

### 3. Identify Boundaries

- Enumerate every point where data enters the system from external sources or crosses an architectural boundary. Standard boundary types: RPC, inherent data, configuration files, databases, file system, native/Wasm interface, network protocol.

### 4. Identify Critical Paths

- Map the paths through the codebase that are consensus-critical: block production, block verification, inherent data creation and validation, genesis initialization, state transitions.

### 5. Enumerate Hooks

- For every component that implements framework hooks (e.g., pallet hooks in Substrate: `on_initialize`, `on_finalize`, `on_idle`, `offchain_worker`), list which hooks exist and which are absent.

### 6. Trace Data Flows

- Apply forward tracing (entry point to sink) and backward tracing (sensitive operation to data source) to map how data moves through the system, recording these traces alongside the component, boundary, and critical-path findings to assemble the `{codebase_map}`. Prioritize candidate points: locations with high code complexity, multiple lock acquisitions, nested match on external data, unsafe blocks, error-handling switches, and codec deserialization sites.

### 7. Identify Safety Overrides

- Search for patterns that override language or framework safety analysis (e.g., `unsafe impl Send/Sync` in Rust, `#[allow]` attributes on safety lints). Each occurrence requires manual verification of the overridden invariant.

## Outputs

### codebase_map

Structured codebase map.

#### artifact

`r-crate-map.json` (component inventory and crate classification) / `r-reconnaissance-data.json` (trust boundaries, critical paths, hooks, data flows, safety overrides)

#### component_inventory

every crate/module with classification and priority

#### trust_boundary_map

every entry point with boundary type

#### critical_path_map

consensus-relevant code paths

#### data_flow_traces

forward and backward traces for priority-1 paths

## Rules

### enumerate-every-component-explicitly

Every pallet and primitive crate is listed explicitly by name and classified by architectural category; each component stands on its own line rather than being summarized or grouped.

### consensus-config-gaps-recorded-as-leads

Consensus-critical configuration structs are enumerated; a struct missing constructor invariant validation is recorded as a reconnaissance lead.
