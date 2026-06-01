---
name: map-codebase
description: A reusable skill for codebase reconnaissance. Defines the enumeration protocol (what to enumerate), classification categories (how to categorize), and tracing techniques (how to map data flows and boundaries). Produces structured inventories that serve as inputs for agent assignment, function registry building, and checklist application.
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

### workspace-root

Path to the workspace Cargo.toml or equivalent project manifest

### in-scope

Paths to include in the analysis

### out-of-scope

*(optional)* Paths to exclude

## Protocol

### 1. Enumerate Components

- Read the workspace manifest and enumerate every crate, module, or package. List each component explicitly by name — do not summarize or group.

### 2. Classify Components

- Assign each component to an architectural category. Standard categories for Substrate codebases: runtime (on-chain/Wasm), native (node binary), shared primitives, off-chain tooling. Assign priority: 1 (consensus-critical), 2 (important), 3 (lower risk), 4 (utility/docs).

### 3. Identify Boundaries

- Enumerate every point where data enters the system from external sources or crosses an architectural boundary. Standard boundary types: RPC, inherent data, configuration files, databases, file system, native/Wasm interface, network protocol.

### 4. Identify Critical Paths

- Map the paths through the codebase that are consensus-critical: block production, block verification, inherent data creation and validation, genesis initialization, state transitions.

### 5. Enumerate Hooks

- For every component that implements framework hooks (e.g., pallet hooks in Substrate: on_initialize, on_finalize, on_idle, offchain_worker), list which hooks exist and which are absent.

### 6. Trace Data Flows

- Apply forward tracing (entry point to sink) and backward tracing (sensitive operation to data source) to map how data moves through the system. Prioritize candidate points: locations with high code complexity, multiple lock acquisitions, nested match on external data, unsafe blocks, error-handling switches, and codec deserialization sites.

### 7. Identify Safety Overrides

- Search for patterns that override language or framework safety analysis (e.g., unsafe impl Send/Sync in Rust, #[allow] attributes on safety lints). Each occurrence requires manual verification of the overridden invariant.

## Outputs

### codebase-map

Structured codebase map.

- **component_inventory**: every crate/module with classification and priority
- **trust_boundary_map**: every entry point with boundary type
- **critical_path_map**: consensus-relevant code paths
- **data_flow_traces**: forward and backward traces for priority-1 paths
