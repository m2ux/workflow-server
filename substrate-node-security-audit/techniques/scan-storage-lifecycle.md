---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 10
  legacy_id: 10
---

## Capability

Audit storage lifecycle completeness for every storage map in a given scope: find all insert/push/append and remove/take call sites, verify pairing (flagging unpaired inserts as finding leads), check capacity enforcement at insertion points, and optionally verify cross-function invariant consistency between paired functions

## Inputs

### scope

Directory scope to scan (a single crate for per-crate review, or full in-scope paths for global scan)

### verify_invariants

*(optional)* Whether to perform cross-function invariant comparison (e.g., do paired `insert`/`remove` functions maintain the same conditions?)

#### default

false

## Protocol

### 1. Find Storage Declarations

- Enumerate every `StorageMap`, `StorageDoubleMap`, and `StorageNMap` in the `{scope}` as `{$storage_maps}`.

### 2. Find Mutation Sites

- For each map in `{storage_maps}`: find every `insert()`/`push()`/`append()` call site and every `remove()`/`take()` call site, recording them as `{$mutation_sites}`.

### 3. Verify Pairing

- For each insert site in `{mutation_sites}`, identify the corresponding remove site on the inverse lifecycle event. Flag unpaired inserts. For each map in `{storage_maps}` with inserts, check if declared capacity constants are enforced at the insertion point. Record each map's results as a row in the `{storage_lifecycle}` pairing table.

### 4. Verify Invariants

- If `{verify_invariants}` is true: for pairs of functions that operate on the same storage (e.g., `handle_create` and `handle_redemption_create`), verify they maintain the same invariants — if one inserts, the other should too under the same conditions.

## Outputs

### storage_lifecycle

Storage lifecycle pairing table with optional invariant comparison.

#### pairing_table

| `StorageMap` | Crate | `insert()` Sites | `remove()` Sites | Paired? | Cap Enforced? |

#### invariant_table

| `StorageMap` | `insert()` Callers | `remove()` Callers | Paired? | Cross-function Consistent? | (optional)
